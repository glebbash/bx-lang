import { BlocksParser } from './blocks-parser';
import { Engine } from './engine/engine';
import { Lexer } from './lexer';

export class Blocks {
    private lexer = new Lexer()
    private parser = new BlocksParser()
    public engine = new Engine()

    eval(source: string): any {
        const tokens = this.lexer.tokenize(source)
        const exprs = this.parser.parseAll(tokens)
        return exprs.map((expr) => expr.eval(this.engine.scope)).slice(-1)[0]
    }

    prettyPrint(source: string): string {
        const tokens = this.lexer.tokenize(source)
        const exprs = this.parser.parseAll(tokens)
        return exprs.map((expr) => expr.print()).join("\n")
    }
}
