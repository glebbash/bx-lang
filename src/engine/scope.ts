import { panic } from "../utils/panic"
import { BValue } from "./engine"

export type Cell = {
    value: BValue
    constant: boolean
}

export class Scope {
    private data = new Map<string, Cell>()

    constructor(private parent?: Scope) {}

    has(name: string): boolean {
        return this.data.has(name)
    }

    getCell(name: string): Cell {
        const val = this.data.get(name)
        if (val === undefined) {
            if (!this.parent) {
                panic(`Error: ${name} is not defined.`)
            }
            return this.parent.getCell(name)
        }
        return val
    }

    get(name: string): BValue {
        return this.getCell(name).value
    }

    define(name: string, value: BValue, constant = false) {
        if (this.has(name)) {
            panic(`Error: ${name} is already defined.`)
        }
        this.data.set(name, { value, constant })
    }

    set(name: string, value: BValue) {
        this.getCell(name).value = value
    }
}
