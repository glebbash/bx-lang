import { BValue, BWrapper } from "./engine"

export class BBoolean extends BWrapper<boolean>("Boolean") {}

export const TRUE = new BBoolean(true)
export const FALSE = new BBoolean(false)

export function bool(b: boolean): BBoolean {
    return b ? TRUE : FALSE
}

export class BNumber extends BWrapper<number>("Number") {}

export class BReturn extends BWrapper<BValue>("Return") {}

export type BFunctionBody = (...args: BValue[]) => BValue

export class BFunction extends BWrapper<BFunctionBody>("Function") {
    call(...args: BValue[]): BValue {
        return this.data(...args)
    }
}

export class BString extends BWrapper<string>("String") {
    toString() {
        return `"${this.data}"`
    }
}

export class BConst extends BValue {
    constructor(type: string) {
        super(type)
    }

    toString() {
        return this.type
    }
}

export class BRange extends BValue {
    constructor(private start: number, private stop: number) {
        super("Range")
    }

    *[Symbol.iterator]() {
        for (let i = this.start; i < this.stop; i++) {
            yield new BNumber(i)
        }
    }

    toString() {
        return `${this.start}..${this.stop}`
    }
}

export const VOID = new BConst("Void")
export const BREAK = new BConst("Break")
