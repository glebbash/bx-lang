import { Context } from "./context"
import { BValue, Engine } from "./engine/engine"
import { VOID } from "./engine/prelude"
import { Scope } from "./engine/scope"
import { Lexer } from "./lexer"
import { Parser } from "./parser"
import { seq } from "./syntax/block"
import { Callback } from "./syntax/expression"

export class Core {
    constructor(
        private lexer: Lexer,
        public parser: Parser,
        public engine: Engine,
        public globalScope: Scope,
    ) {}

    eval(source: string, cb: Callback, ctx?: Context) {
        const tokens = this.lexer.tokenize(source)
        const exprs = this.parser.parseAll(tokens)
        const context: Context = ctx ?? {
            scope: new Scope(this.globalScope),
            core: this,
        }
        let res: BValue = VOID
        seq(
            context,
            exprs,
            (val, err, next) => {
                if (err) return cb(VOID, err)
                res = val
                next()
            },
            () => cb(res),
        )
    }

    prettyPrint(source: string): string {
        const tokens = this.lexer.tokenize(source)
        const exprs = this.parser.parseAll(tokens)
        return exprs.map((expr) => expr.toString()).join("\n")
    }
}
