import { Context } from "../context"
import { VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { expectIndent } from "./ident"
import { PrefixParser } from "./prefix-op"

export const define = (constant: boolean): PrefixParser<DefineExpr> => (
    parser: Parser,
) => {
    const identExpr = expectIndent(parser)
    parser.expect({ value: "=" })
    return new DefineExpr(identExpr.name, parser.parse(), constant)
}

export class DefineExpr implements Expression {
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
        return `let ${this.name} = ${this.expr}`
    }
}
