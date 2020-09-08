import { BlocksParser } from "./blocks-parser"
import { Context } from "./core"
import { BValue, Engine } from "./engine/engine"
import { BArray, BFunction, BString, VOID } from "./engine/prelude"
import { Scope } from "./engine/scope"
import { Lexer } from "./lexer"

export class Blocks {
    lexer = new Lexer()
    parser = new BlocksParser()
    engine = new Engine()
    globalScope = new Scope()

    constructor() {
        this.engine.addType("Boolean")
        this.engine.addType("Number")
        this.engine.addType("String")
        const Array = this.engine.addType("Array")
        this.engine.addType("Object")
        this.engine.addType("Function")

        Array.addMethod("map", (arr, funV) => {
            const fun = funV.as(BFunction)
            return new BArray(arr.as(BArray).data.map((e) => fun.call(e)))
        }).addMethod("fold", (arr, init, funV) => {
            const fun = funV.as(BFunction)
            return arr
                .as(BArray)
                .data.reduce((acc, val) => fun.call(acc, val), init)
        })
        this.globalScope.define(
            "print",
            new BFunction((val) => {
                console.log(val.toString())
                return VOID
            }),
        )
        this.globalScope.define(
            "input",
            new BFunction((fun: BValue) => {
                const cb = fun.as(BFunction)
                process.stdin.once("data", (data) => {
                    cb.call(new BString(data.toString().slice(0, -1)))
                })
                return VOID
            }),
        )
        this.globalScope.define(
            "pp",
            new BFunction((val) => {
                const expr = val.as(BString).data
                return new BString(this.prettyPrint(expr))
            }),
            true,
        )
    }

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
