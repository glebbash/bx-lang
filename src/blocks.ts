import { readFileSync } from "fs"
import { BlocksParser } from "./blocks-parser"
import { Context } from "./core"
import { BValue, Engine } from "./engine/engine"
import {
    BArray,
    BFunction,
    BGenerator,
    BNumber,
    BObject,
    bool,
    BString,
    VOID,
} from "./engine/prelude"
import { Scope } from "./engine/scope"
import { Lexer } from "./lexer"

export class Blocks {
    lexer = new Lexer()
    parser = new BlocksParser()
    engine = new Engine()
    globalScope = new Scope()

    constructor(public rootPath: string) {
        const Any = this.engine.addType("Any")
        this.engine.addType("Boolean", "Any")
        this.engine.addType("Number", "Any")
        this.engine.addType("String", "Any")
        const Array = this.engine.addType("Array", "Any")
        this.engine.addType("Object", "Any")
        this.engine.addType("Function", "Any")
        const Generator = this.engine.addType("Generator", "Function")

        Any.addMethod("also", (val, fun) => {
            fun.as(BFunction).call(val)
            return val
        })

        Generator.addMethod("next", (gen, val?: BValue) => {
            return gen.as(BGenerator).next(val)
        }).addMethod("hasNext", (gen) => {
            return bool(!gen.as(BGenerator).ended)
        })

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
            "require",
            new BFunction((pathV) => {
                const path = pathV.as(BString).data

                const importCtx: Context = {
                    scope: new Scope(this.globalScope, new Set()),
                    core: this,
                }
                this.evalFile(path, importCtx)

                const obj = new BObject({})
                for (const key of importCtx.scope.exports!) {
                    obj.data[key] = importCtx.scope.get(key)
                }
                return obj
            }),
            true,
        )
        this.globalScope.define(
            "type",
            new BFunction((val) => new BString(val.type)),
        )
        this.globalScope.define(
            "Parse",
            new BObject({
                number: new BFunction((str) => {
                    return new BNumber(Number(str.as(BString).data))
                }),
            }),
        )
    }

    evalFile(path: string, ctx?: Context): BValue {
        const filePath = this.rootPath + "/" + path.replace(/\./g, "/") + ".bx"
        const file = readFileSync(filePath, {
            encoding: "utf-8",
        })
        return this.eval(file, ctx)
    }

    eval(source: string, ctx?: Context): BValue {
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
