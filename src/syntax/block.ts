import { Parser } from "../parser"
import { Expr, Token } from "../lexer"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"
import { Scope } from "../engine/scope"

export const BLOCK_PARSER: PrefixParser = (parser: Parser, token: Token) => {
    const exprs = token.value as Expr[]
    return new BlockExpr(exprs.map((expr) => parser.parseSubExpr(expr)))
}

export class BlockExpr implements Expression {
    constructor(private body: Expression[]) {}

    eval(scope: Scope) {
        return this.body.map((expr) => expr.eval(scope)).slice(-1)[0]
    }

    print(): string {
        return `{${this.body.map((it) => it.print()).join(";")};}`
    }
}
