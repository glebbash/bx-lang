import { readFileSync } from 'fs';

import { Blocks } from '../src/core';

const data = readFileSync("data/main.bx", { encoding: "utf-8" })
new Blocks().eval(data)