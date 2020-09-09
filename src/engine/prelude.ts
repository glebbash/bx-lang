import { Context } from "../core"
import { BlockExpr } from "../syntax/block"
import { panic } from "../utils/panic"
import { BValue, BWrapper } from "./engine"

/////////////////

export class BBoolean extends BWrapper<boolean> {}

export const TRUE = new BBoolean(true)
export const FALSE = new BBoolean(false)

export const bool = (b: boolean) => (b ? TRUE : FALSE)

/////////////////

export class BNumber extends BWrapper<number> {}

/////////////////

export class BString extends BWrapper<string> {
    [Symbol.iterator]() {
        return this.data[Symbol.iterator]()
    }
}

/////////////////

export class BArray extends BWrapper<BValue[]> {
    [Symbol.iterator]() {
        return this.data[Symbol.iterator]()
    }
    toString() {
        return `[${this.data.map((it) => it.toString()).join(", ")}]`
    }
}

/////////////////

export class BObject extends BWrapper<Record<string, BValue>> {
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

/////////////////

export class BBreak extends BWrapper<number> {}

export class BContinue extends BWrapper<number> {}

export class BReturn extends BWrapper<BValue> {}

/////////////////

export class BPause extends BWrapper<BValue> {}

export class BStop extends BWrapper<BValue> {}

export type ExecState = {
    resume(value?: BValue): BValue
}

export type PausedExec = {
    execStack: ExecState[]
    returned: BValue
}

export class BPausedExec extends BWrapper<PausedExec> {}

export class BGenerator extends BValue {
    pausedExec: PausedExec = {
        execStack: [],
        returned: VOID,
    }
    ended = false

    constructor(public ctx: Context, public block: BlockExpr) {
        super()
    }

    next(_val?: BValue): BValue {
        if (this.ended) {
            return this.pausedExec.returned
        }

        // first run
        if (this.pausedExec.execStack.length === 0) {
            const res = this.block.eval(this.ctx)
            if (res.is(BPausedExec)) {
                this.pauseOn(res)
            } else {
                this.endOn(res)
            }
            return this.pausedExec.returned
        }

        let res = this.pausedExec.returned
        while (true) {
            res = this.pausedExec.execStack.pop()!.resume(res)
            if (res.is(BPausedExec)) {
                this.pauseOn(res)
                break
            }
            if (this.pausedExec.execStack.length === 0) {
                this.endOn(res)
                break
            }
        }
        return this.pausedExec.returned
    }

    private pauseOn(pe: BPausedExec) {
        this.pausedExec.returned = pe.data.returned
        this.pausedExec.execStack.push(...pe.data.execStack)
    }

    private endOn(val: BValue) {
        this.ended = true
        this.pausedExec = {
            execStack: [],
            returned: val.is(BReturn) ? val.data : val,
        }
    }

    toString() {
        return "generator"
    }
}

/////////////////

export class BVoid extends BValue {
    toString() {
        return "void"
    }
}

export const VOID = new BVoid()

/////////////////

export type BFunctionBody = (...args: BValue[]) => BValue

export class BFunction extends BWrapper<BFunctionBody> {
    constructor(body: BFunctionBody) {
        super(body)
    }

    call(...args: BValue[]): BValue {
        return this.data(...args)
    }

    toString() {
        return "function"
    }
}

/////////////////

export class BRange extends BValue {
    constructor(private start: number, private stop: number) {
        super()
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
