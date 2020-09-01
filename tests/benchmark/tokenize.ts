import Benchmark from "benchmark"
import { readFileSync } from "fs"
import { Lexer } from "../../src/lexer"

const data = readFileSync("data/test1.bx", { encoding: "utf-8" })

Benchmark.options.minSamples = 500

const lexer = new Lexer()

new Benchmark.Suite()
    .add("def", () => {
        for (const x of lexer.tokenizeIter(data)) {
            x.length
        }
    })
    .add("array", () => {
        for (const x of lexer.tokenize(data)) {
            x.length
        }
    })
    .on("cycle", (ev: Event) => {
        console.log(String(ev.target))
    })
    .on("complete", function (this: Benchmark.Suite) {
        console.log("Fastest is " + this.filter("fastest").map("name" as any))
    })
    .run({ async: true })
