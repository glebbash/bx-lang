export class AutoMap<T> extends Map<string, T> {
    constructor(private defaultValueBuilder: (key: string) => T) {
        super()
    }

    getAuto(key: string) {
        const val = super.get(key)
        if (val !== undefined) {
            return val
        }
        const newVal = this.defaultValueBuilder(key)
        this.set(key, newVal)
        return newVal
    }

    getOr<T2>(key: string, def: T2): T | T2 {
        return this.get(key) ?? def
    }
}
