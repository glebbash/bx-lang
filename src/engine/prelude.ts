import { panic } from "../utils/panic"
import { BValue, BWrapper } from "./engine"

export class BBoolean extends BWrapper<boolean>("Boolean") {}

export const TRUE = new BBoolean(true)
export const FALSE = new BBoolean(false)

export function bool(b: boolean): BBoolean {
    return b ? TRUE : FALSE
}

export class BNumber extends BWrapper<number>("Number") {}

export class BString extends BWrapper<string>("String") {
    [Symbol.iterator]() {
        return this.data[Symbol.iterator]()
    }
}

export class BArray extends BWrapper<BValue[]>("Array") {
    [Symbol.iterator]() {
        return this.data[Symbol.iterator]()
    }
    toString() {
        return `[${this.data.map((it) => it.toString()).join(", ")}]`
    }
}

export class BObject extends BWrapper<Record<string, BValue>>("Object") {
    get(prop: string): BValue {
        return this.data[prop] ?? panic(`Prop ${prop} is not defined`)
    }

    set(prop: string, val: BValue) {
        this.data[prop] = val
    }

    *[Symbol.iterator]() {
        for (const [key, val] of Object.entries(this.data)) {
            yield new BArray([new BString(key), val])
        }
    }

    toString() {
        return `{ ${Object.entries(this.data)
            .map(([name, val]) => name + ": " + val)
            .join(", ")} }`
    }
}

export class BBreak extends BWrapper<number>("Break") {}

export class BContinue extends BWrapper<number>("Continue") {}

export class BReturn extends BWrapper<BValue>("Return") {}

export type BFunctionBody = (...args: BValue[]) => BValue

export class BFunction extends BWrapper<BFunctionBody>("Function") {
    constructor(body: BFunctionBody, private name?: string) {
        super(body)
    }
    call(...args: BValue[]): BValue {
        return this.data(...args)
    }

    toString() {
        return this.name ? `function ${this.name}` : "function"
    }
}

export class BRange extends BValue {
    constructor(private start: number, private stop: number) {
        super("Range")
    }

    *[Symbol.iterator]() {
        for (let i = this.start; i <= this.stop; i++) {
            yield new BNumber(i)
        }
    }

    toString() {
        return `${this.start}..${this.stop}`
    }
}

export class BConst extends BValue {
    constructor(type: string) {
        super(type)
    }

    toString() {
        return this.type.toLowerCase()
    }
}

export const VOID = new BConst("Void")
