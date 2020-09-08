import { action, Context, Expression } from "../core"
import { BFunction, BObject } from "../engine/prelude"
import { Token } from "../lexer"
import { ARRAY } from "./array"
import { expectIdent } from "./ident"

export const doubleSemi = (precedence: number) =>
    action(precedence, (parser, _token: Token, obj: Expression) => {
        const name = expectIdent(parser, true).name
        if (parser.nextIs({ type: "block_paren" })) {
            return new PropCallExpr(
                name,
                obj,
                ARRAY(parser, parser.next()).items,
            )
        }
        return new MethodGetExpr(name, obj)
    })

export class PropCallExpr implements Expression {
    constructor(
        private name: string,
        private object: Expression,
        private args: Expression[],
    ) {}

    eval(ctx: Context) {
        const args = this.args.map((arg) => arg.eval(ctx))
        return this.object
            .eval(ctx)
            .as(BObject)
            .get(this.name)
            .as(BFunction)
            .call(...args)
    }

    toString(symbol = "", indent = ""): string {
        return `${this.object}::${this.name}(${this.args
            .map((it) => it.toString(symbol, indent))
            .join(", ")})`
    }
}

export class MethodGetExpr implements Expression {
    constructor(private prop: string, private object: Expression) {}

    eval(ctx: Context) {
        return this.object.eval(ctx).as(BObject).get(this.prop)
    }

    toString(symbol = "", indent = ""): string {
        return `${this.object.toString(symbol, indent)}::${this.prop}`
    }
}
