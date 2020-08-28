import { Expression } from "../expressions/expression";
import { Parser } from "../parser";
import { Token } from "../tokenizer";

export interface PostfixParser {
    precedence: number

    parse(parser: Parser, token: Token, expr: Expression): Expression
}