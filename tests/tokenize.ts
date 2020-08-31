import { readFileSync } from 'fs';

import { Lexer } from './lexer';

const data = readFileSync("data/main.bx", { encoding: "utf-8" })
const tokens = new Lexer().tokenize(data)
console.dir(tokens, { depth: 10 })
