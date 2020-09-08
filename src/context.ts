import { Blocks } from "./blocks"
import { Scope } from "./engine/scope"

export interface Context {
    scope: Scope
    core: Blocks
}

export function subContext(ctx: Context): Context {
    return { scope: new Scope(ctx.scope), core: ctx.core }
}
