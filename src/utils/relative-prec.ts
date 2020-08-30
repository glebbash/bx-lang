export function precedence() {
    const data: Record<string, number> = {
        MIN: 0,
        MAX: Number.MAX_SAFE_INTEGER,
    }
    
    const insert = (
        name: string,
        after: string,
        before: string,
    ): [string, number] => {
        const prec = Math.round((data[after] + data[before]) / 2)
        data[name] = prec
        return [name, prec]
    }

    return (name: string) => ({
        between: (a: string, b: string) => insert(name, a, b),
        lessThan: (val: string) => insert(name, "MIN", val),
        moreThan: (val: string) => insert(name, val, "MAX"),
        sameAs: (val: string) => insert(name, val, val),
    })
}
