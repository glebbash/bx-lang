import { readFileSync } from 'fs';

import { Lexer } from './lexer';

console.log("start")
const data = readFileSync("data/test1.bx", { encoding: "utf-8" })
const tokens = new Lexer().tokenize(data)
console.dir(tokens, { depth: 10 })
