import { readFileSync } from "fs"
import { Blocks } from "../src/blocks"

const data = readFileSync("data/main.bx", { encoding: "utf-8" })
const core = new Blocks()
const was = new Date().getTime()
core.eval(data, (_, err) => {
    if (err) {
        console.log(err)
    } else {
        const time = new Date().getTime() - was
        console.log(`Script evaluated in ${time}ms`)
    }
})
