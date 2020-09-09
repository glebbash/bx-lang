import { Blocks } from "../src/blocks"

const core = new Blocks(process.cwd() + "/data")
core.evalFile("main")
