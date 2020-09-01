import { Context } from "./context"
import { Engine } from "./engine/engine"
import { Scope } from "./engine/scope"
import { Lexer } from "./lexer"
import { Parser } from "./parser"

export class Core {
    constructor(
        private lexer: Lexer,
        public parser: Parser,
        public engine: Engine,
        public globalScope: Scope,
    ) {}

    eval(source: string, ctx?: Context) {
        const tokens = this.lexer.tokenize(source)
        const exprs = this.parser.parseAll(tokens)
        const context: Context = ctx ?? {
            scope: new Scope(this.globalScope),
            core: this,
        }
        return exprs.map((expr) => expr.eval(context)).slice(-1)[0]
    }

    prettyPrint(source: string): string {
        const tokens = this.lexer.tokenize(source)
        const exprs = this.parser.parseAll(tokens)
        return exprs.map((expr) => expr.toString()).join("\n")
    }
}
