export const stream = <T>(items: T[]) => {
    let i = 0
    return (consume = true) =>
        i < items.length ? items[consume ? i++ : i] : null
}

export const streamIter = <T>(items: Iterable<T>) => {
    const iterator = items[Symbol.iterator]()
    let holding = false
    let buff: IteratorResult<T> = { done: false, value: null as any }
    return (consume = true) => {
        const res = holding ? buff : iterator.next()
        holding = !consume
        if (holding) buff = res
        return res.done ? null : res.value
    }
}
