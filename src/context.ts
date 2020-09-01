import { Core } from "./core"
import { Scope } from "./engine/scope"

export interface Context {
    scope: Scope
    core: Core
}

export function subContext(ctx: Context): Context {
    return { scope: new Scope(ctx.scope), core: ctx.core }
}
