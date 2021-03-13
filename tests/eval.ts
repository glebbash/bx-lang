import { Blocks } from "../src/blocks"

const core = new Blocks(process.cwd() + "/../bx-lang-haxe/scripts")
core.evalFile("main")
