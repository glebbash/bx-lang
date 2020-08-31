import { BValue } from "../engine/engine"
import { BReturn, VOID } from "../engine/prelude"
import { Scope } from "../engine/scope"
import { Expr, Token } from "../lexer"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const BLOCK: PrefixParser = (parser: Parser, token: Token) => {
    const exprs = token.value as Expr[]
    return new BlockExpr(exprs.map((expr) => parser.parseSubExpr(expr)))
}

export class BlockExpr implements Expression {
    constructor(private body: Expression[]) {}

    eval(scope: Scope) {
        let res: BValue = VOID
        for (const expr of this.body) {
            res = expr.eval(scope)
            if (res.is(BReturn)) {
                return res.data
            }
        }
        return res
    }

    print(): string {
        return `{${this.body.map((it) => it.print()).join(";")};}`
    }
}
