import { readFileSync } from 'fs';

import { Tokenizer } from '../../src/new/tokenizer';

console.log("start")
const data = readFileSync("data/test1.new", { encoding: "utf-8" })
const tokens = new Tokenizer().tokenize(data)
console.dir(tokens, { depth: 10 })
