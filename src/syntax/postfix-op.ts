import { Parser } from '../parser';
import { Token } from '../tokenizer';
import { Expression } from './expression';

export interface PostfixParser {
    precedence: number

    parse(parser: Parser, token: Token, expr: Expression): Expression
}
