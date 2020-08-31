import { BValue } from "../engine/engine"
import { BFunction, BReturn, VOID } from "../engine/prelude"
import { Scope } from "../engine/scope"
import { Expr } from "../lexer"
import { Parser } from "../parser"
import { BLOCK } from "./block"
import { Expression } from "./expression"
import { IDENT } from "./ident"
import { PrefixParser } from "./prefix-op"

export const FUN: PrefixParser<FunExpr> = (parser: Parser) => {
    const name = IDENT(parser, parser.expect({ type: "identifier" })).name
    const paramsExpr = parser.expect({ type: "block_paren" })
    const params = (paramsExpr.value as Expr[])[0].map(
        (it) => it.value as string,
    )
    const body = parser.nextIs({ value: "=" })
        ? (parser.next(), parser.parse())
        : BLOCK(parser, parser.next())
    return new FunExpr(name, params, body)
}

export class FunExpr implements Expression {
    constructor(
        private name: string,
        private params: string[],
        private body: Expression,
    ) {}

    eval(scope: Scope) {
        scope.define(
            this.name,
            new BFunction((...args: BValue[]) => {
                const funScope = new Scope(scope)
                for (let i = 0; i < this.params.length; i++) {
                    if (i < args.length) {
                        funScope.define(this.params[i], args[i])
                    }
                }
                const res = this.body.eval(funScope)
                return res.is(BReturn) ? res.data : res
            }),
        )
        return VOID
    }

    print(): string {
        return `fun ${this.name}(${this.params}) { ${this.body.print()} }`
    }
}
