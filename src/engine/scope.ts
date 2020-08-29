import { panic } from '../utils/panic';
import { BValue } from './engine';

export type Cell = {
    value: BValue
    constant: boolean
}

export class Scope {
    private data = new Map<string, Cell>()

    has(name: string) {
        return this.data.has(name)
    }

    getCell(name: string): Cell {
        return this.data.get(name) ?? panic(`Error: ${name} is not defined.`)
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
