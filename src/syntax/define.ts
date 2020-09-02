import { Context } from "../context"
import { BArray, BObject, VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { panic } from "../utils/panic"
import { ARRAY } from "./array"
import { Expression } from "./expression"
import { expectIdent } from "./ident"
import { KVPair, OBJECT } from "./object"
import { PrefixParser } from "./prefix-op"

export const define = (
    constant: boolean,
): PrefixParser<DefineIdentExpr | DefineArrayExpr | DefineObjectExpr> => (
    parser: Parser,
) => {
    if (parser.nextIs({ type: "block_bracket" })) {
        const arr = ARRAY(parser, parser.next())
        parser.expect({ value: "=" })
        return new DefineArrayExpr(
            arr.items.map((it) => it.toString()),
            null,
            parser.parse(),
            constant,
        )
    } else if (parser.nextIs({ type: "block_brace" })) {
        const obj = OBJECT(parser, parser.next())
        parser.expect({ value: "=" })
        return new DefineObjectExpr(obj.pairs, null, parser.parse(), constant)
    } else {
        const name = expectIdent(parser).name
        parser.expect({ value: "=" })
        return new DefineIdentExpr(name, parser.parse(), constant)
    }
}

export class DefineIdentExpr implements Expression {
    constructor(
        private name: string,
        private expr: Expression,
        private constant: boolean,
    ) {}

    eval(ctx: Context) {
        ctx.scope.define(this.name, this.expr.eval(ctx), this.constant)
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return (
            (this.constant ? "const" : "let") +
            this.name +
            " = " +
            this.expr.toString(symbol, indent)
        )
    }
}

export class DefineArrayExpr implements Expression {
    constructor(
        private names: string[],
        private vararg: string | null,
        private expr: Expression,
        private constant: boolean,
    ) {}

    eval(ctx: Context) {
        const arr = this.expr.eval(ctx).as(BArray).data
        if (this.names.length > arr.length) {
            panic(
                `Trying to assign ${arr.length} element(s) to ${this.names.length} name(s)`,
            )
        }
        let i = 0
        for (; i < this.names.length; i++) {
            const name = this.names[i]
            const val = arr[i]
            ctx.scope.define(name, val, this.constant)
        }
        if (this.vararg !== null && i < arr.length - 1) {
            ctx.scope.define(name, new BArray(arr.slice(i)), this.constant)
        }
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return (
            (this.constant ? "const" : "let") +
            "[" +
            this.names.join(", ") +
            "] = " +
            this.expr.toString(symbol, indent)
        )
    }
}

export class DefineObjectExpr implements Expression {
    constructor(
        private pairs: KVPair[],
        private vararg: string | null,
        private expr: Expression,
        private constant: boolean,
    ) {}

    eval(ctx: Context) {
        const obj = this.expr.eval(ctx).as(BObject)
        for (const [name] of this.pairs) {
            ctx.scope.define(name, obj.get(name), this.constant)
        }
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return (
            (this.constant ? "const" : "let") +
            "{" +
            this.pairs
                .map(([key, val]) => (key + val ? ":" + val : ""))
                .join(", ") +
            "} = " +
            this.expr.toString(symbol, indent)
        )
    }
}
