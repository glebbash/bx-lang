import { Atom, Context, Expression, ExprParser, subContext } from "../core"
import { BValue } from "../engine/engine"
import { BPausedExec, BFunction, BReturn, VOID } from "../engine/prelude"
import { panic } from "../utils/panic"
import { syntaxError } from "../utils/syntax-error"
import { ARRAY } from "./array"
import { BlockExpr, blockOrExpr } from "./block"
import { ExportableExpr } from "./export"
import { IDENT, IdentExpr } from "./ident"

export const FUN: Atom<FunExpr | NamedFunExpr> = (parser: ExprParser) => {
    const name = parser.nextIs({ complexType: "<IDENT>" })
        ? IDENT(parser, parser.next()).name
        : null

    const paramsToken = parser.expect({ type: "block_paren" })
    const paramsExpr = ARRAY(parser, paramsToken)
    const params = paramsExpr.items.map((paramExpr) => {
        if (paramExpr instanceof IdentExpr) {
            return paramExpr.name
        }
        syntaxError("Invalid function params", paramsToken.start)
    })

    const body = blockOrExpr(parser)
    const fun = new FunExpr(params, body)

    return name === null ? fun : new NamedFunExpr(name, fun)
}

export class NamedFunExpr implements Expression, ExportableExpr {
    constructor(public name: string, private fun: FunExpr) {}

    export(exports: Set<string>): void {
        if (exports!.has(this.name)) {
            panic(`Cannot re-export '${this.name}'`)
        }
        exports!.add(this.name)
    }

    eval(ctx: Context) {
        const fun = this.fun.eval(ctx)
        ctx.scope.define(this.name, fun)
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return `fun ${this.name}(${this.fun.params.join(
            ", ",
        )}) ${this.fun.body.toString(symbol, indent)}`
    }
}

export class FunExpr implements Expression {
    constructor(public params: string[], public body: BlockExpr) {}

    eval(ctx: Context) {
        return new BFunction((...args: BValue[]) => {
            const funCtx = subContext(ctx)
            const pLen = this.params.length
            const aLen = args.length
            for (let i = 0; i < pLen; i++) {
                if (i < aLen) {
                    funCtx.scope.define(this.params[i], args[i])
                }
            }
            const res = this.body.eval(funCtx)
            if (res.is(BPausedExec)) {
                panic("Attempt to pause normal function")
            }
            return res.is(BReturn) ? res.data : res
        })
    }

    toString(symbol = "", indent = ""): string {
        return `fun(${this.params.join(", ")}) ${this.body.toString(
            symbol,
            indent,
        )}`
    }
}
