import { readFileSync } from "fs"
import { Blocks } from "../src/blocks"

const data = readFileSync("data/main.bx", { encoding: "utf-8" })
const core = new Blocks()
core.eval(data)
