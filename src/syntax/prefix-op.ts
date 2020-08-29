import { Parser } from "../parser"
import { Token } from "../tokenizer"
import { Expression } from "./expression"

export type PrefixParser<T extends Expression = Expression> = (
    parser: Parser,
    token: Token,
) => T
