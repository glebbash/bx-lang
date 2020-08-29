import Benchmark from 'benchmark';
import { readFileSync } from 'fs';

import { Tokenizer as T1 } from '../../src/new/tokenizer';

const data = readFileSync("data/main.nips", { encoding: "utf-8" })

Benchmark.options.minSamples = 500

new Benchmark.Suite()
    .add("config", () => {
        new T1(data).tokenize()
    })
    .add("const", () => {
        new T2(data).tokenize()
    })
    .on("cycle", (ev: Event) => {
        console.log(String(ev.target))
    })
    .on("complete", function (this: Benchmark.Suite) {
        console.log("Fastest is " + this.filter("fastest").map("name" as any))
    })
    .run({ async: true })
