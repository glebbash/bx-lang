import { Blocks } from "../core"
import { Parser } from "../parser"
import { Token } from "../tokenizer"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const IDENT_PARSER: PrefixParser<IdentExpr> = {
    parse(_parser: Parser, token: Token) {
        return new IdentExpr(token.value as string)
    },
}

export class IdentExpr implements Expression {
    constructor(public name: string) {}

    eval(core: Blocks) {
        return core.engine.scope.get(this.name)
    }

    print() {
        return this.name
    }
}
