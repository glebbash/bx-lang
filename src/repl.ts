import readline from "readline"
import { Blocks } from "./blocks"
import { Context } from "./context"
import { Scope } from "./engine/scope"

const core = new Blocks()
const evalCtx: Context = { scope: new Scope(core.globalScope), core }

process.stdout.write("> ")

readline
    .createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    })
    .on("line", function (line) {
        try {
            const res = core.eval(line, evalCtx)
            console.log("=", res.toString())
        } catch (e) {
            console.log("!", e.toString())
        }
        process.stdout.write("> ")
    })
