import { Blocks } from "./core"
import readline from "readline"

const core = new Blocks()

process.stdout.write("> ")

readline
    .createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    })
    .on("line", function (line) {
        const res = core.eval(line)
        console.log("=", res)
        process.stdout.write("> ")
    })
