import { Tokenizer } from "../../src/new/tokenizer"
import { readFileSync } from "fs"

console.log("start")
const data = readFileSync("data/test1.new", { encoding: "utf-8" })
const tokens = new Tokenizer().tokenize(data)
console.dir(tokens, { depth: 10 })
