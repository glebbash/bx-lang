import { Parser } from '../parser';
import { Token } from '../tokenizer';
import { Expression } from './expression';

export interface PrefixParser<T extends Expression = Expression> {
    parse(parser: Parser, token: Token): T
}
