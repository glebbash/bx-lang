import { AutoMap } from "../utils/auto-map"
import { panic } from "../utils/panic"

export type BMethod = (self: BValue, ...args: BValue[]) => BValue
export type BMethodBound = (...args: BValue[]) => BValue
export type Constructor<T> = { new (...args: any): T }

export class BType {
    private methods = new AutoMap(() => [] as BMethod[])

    constructor(
        private engine: Engine,
        public name: string,
        private parent: string | null = null,
    ) {}

    addMethod(name: string, method: BMethod) {
        this.methods.getAuto(name).push(method)
        return this
    }

    getMethod(name: string): BMethod | null {
        const methods = this.methods.getOr(name, [null])
        const method = methods[methods.length - 1]

        if (method !== null) return method

        return this.parent !== null
            ? this.engine.getType(this.parent)!.getMethod(name)
            : null
    }

    expectMethod(name: string): BMethod {
        const method = this.getMethod(name)
        if (method == null) {
            panic(`Type ${this.name} has no '${name}' method.`)
        }
        return method
    }

    toString() {
        return this.name
    }
}

export abstract class BValue {
    constructor(public type: string) {}

    as<T extends BValue>(type: Constructor<T>): T {
        return this.is(type)
            ? this
            : panic(`Cannot cast ${this.type} to ${type.name.slice(1)}`)
    }

    is<T extends BValue>(type: Constructor<T>): this is T {
        return this.constructor === type
    }

    invoke(engine: Engine, methodName: string, ...args: BValue[]): BValue {
        const method = engine.expectType(this.type).expectMethod(methodName)
        return method(this, ...args)
    }

    equals(other: BValue) {
        return this === other
    }

    abstract toString(): string
}

export function BWrapper<T>(type: string) {
    return class extends BValue {
        constructor(public data: T) {
            super(type)
        }

        equals(other: BValue) {
            return other.type === this.type && (other as any).data === this.data
        }

        toString() {
            return "" + this.data
        }
    }
}

export class Engine {
    private types = new Map<string, BType>()

    addType(name: string, parent?: string) {
        const type = new BType(this, name, parent)
        this.types.set(name, type)
        return type
    }

    getType(name: string): BType | null {
        return this.types.get(name) ?? null
    }

    expectType(name: string): BType {
        const type = this.getType(name)
        if (type === null) {
            panic(`There is no ${name} type in this context.`)
        }
        return type
    }
}

type BClass<T, F> = T & { new: F } & {
    [key: string]: BMethod
}

export function Class<T extends BType, F extends Function>(
    obj: T,
    fun: F,
): BClass<T, F> {
    return <any>new Proxy(obj, {
        get: (target, key: string) => {
            if (key in target) return (target as any)[key]
            if (key === "name") return obj.name
            if (key === "new") {
                return (...args: any) => fun(...args)
            }
            return target.expectMethod(key)
        },
        set: (target, key: string, val) => {
            target.addMethod(key, val)
            return true
        },
    })
}

export function caller(engine: Engine) {
    return <T extends BValue>(obj: T): T & { [key: string]: BMethodBound } => {
        return new Proxy(obj, {
            get: (target, prop: string) => {
                if (prop in target) return (target as any)[prop]
                const method = engine.expectType(target.type).expectMethod(prop)
                return (...args: BValue[]) => method(target, ...args)
            },
        }) as any
    }
}
