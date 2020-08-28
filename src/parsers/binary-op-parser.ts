import { BinaryOpExpr } from "../expressions/binary-op-expr";
import { Expression } from "../expressions/expression";
import { Parser } from "../parser";
import { Token } from "../tokenizer";
import { PostfixParser } from "./postfix-parser";

export const binaryOpParser = (precedence: number, fun: (...args: any[]) => any): PostfixParser => ({
    precedence,
    parse(parser: Parser, token: Token, expr1: Expression): Expression {
        const expr2 = parser.parse(precedence)
        return new BinaryOpExpr(token.value as string, expr1, expr2, fun)
    }
})