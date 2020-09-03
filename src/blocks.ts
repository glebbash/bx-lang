import { BlocksParser } from "./blocks-parser"
import { Core } from "./core"
import { BValue, Engine } from "./engine/engine"
import { BArray, BFunction, BString } from "./engine/prelude"
import { Scope } from "./engine/scope"
import { Lexer } from "./lexer"

export class Blocks extends Core {
    constructor() {
        super(new Lexer(), new BlocksParser(), new Engine(), new Scope())

        this.engine.addType("Boolean")
        this.engine.addType("Number")
        this.engine.addType("String")
        this.engine.addType("Array")
        this.engine.addType("Object")
        this.engine.addType("Function")

        this.engine
            .expectType("Array")
            .addMethod("map", (arr, funV) => {
                const fun = funV.as(BFunction)
                return new BArray(arr.as(BArray).data.map((e) => fun.call(e)))
            })
            .addMethod("fold", (arr, init, funV) => {
                const fun = funV.as(BFunction)
                return arr
                    .as(BArray)
                    .data.reduce((acc, val) => fun.call(acc, val), init)
            })
        this.globalScope.define(
            "pp",
            new BFunction((val: BValue) => {
                const expr = val.as(BString).data
                return new BString(this.prettyPrint(expr))
            }),
            true,
        )
    }
}
