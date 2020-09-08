import { BlocksParser } from "./blocks-parser"
import { Core } from "./core"
import { BValue, Engine } from "./engine/engine"
import { BArray, BFunction, BString, VOID } from "./engine/prelude"
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
            .addMethod("map", (arr, cb, funV) => {
                const fun = funV.as(BFunction)
                const orig = arr.as(BArray).data
                const res: BValue[] = []
                let i = 0
                const next = () => {
                    if (i >= orig.length) {
                        return cb(new BArray(res))
                    }
                    const item = orig[i]
                    fun.call((val, err) => {
                        if (err) return cb(VOID, err)
                        res.push(val)
                        next()
                    }, item)
                }
                next()
            })
            .addMethod("fold", (arrV, cb, init, funV) => {
                const fun = funV.as(BFunction)
                const arr = arrV.as(BArray).data
                let res = init
                let i = 0
                const next = () => {
                    if (i >= arr.length) {
                        return cb(res)
                    }
                    const item = arr[i]
                    fun.call((val, err) => {
                        if (err) return cb(VOID, err)
                        res = val
                        next()
                    }, res, item)
                }
                next()
            })
        this.globalScope.define(
            "print",
            new BFunction((cb, val) => {
                console.log(val.toString())
                cb(VOID)
            }),
        )
        this.globalScope.define(
            "input",
            new BFunction((cb, message?: BValue) => {
                if (message) {
                    process.stdout.write(message.as(BString).data)
                }
                process.stdin.once("data", (data) => {
                    cb(new BString(data.toString().slice(0, -1)))
                })
            }),
        )
        this.globalScope.define(
            "pp",
            new BFunction((cb, val) => {
                const expr = val.as(BString).data
                cb(new BString(this.prettyPrint(expr)))
            }),
            true,
        )
    }
}
