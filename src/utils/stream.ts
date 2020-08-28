export const stream = <T>(items: T[]) => {
    let i = 0
    return (consume = true) =>
        i < items.length ? items[consume ? i++ : i] : null
}