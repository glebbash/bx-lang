import { Context, subContext } from "../context"
import { BValue } from "../engine/engine"
import { BFunction, BReturn, VOID } from "../engine/prelude"
import { panic } from "../utils/panic"
import { syntaxError } from "../utils/syntax-error"
import { ARRAY } from "./array"
import { blockOrExpr } from "./block"
import { Atom, Expression, ExprParser } from "./core"
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

    return name === null
        ? new FunExpr(params, body)
        : new NamedFunExpr(name, params, body)
}

function makeFunction(
    ctx: Context,
    params: string[],
    body: Expression,
    name?: string,
) {
    return new BFunction((...args: BValue[]) => {
        const funCtx = subContext(ctx)
        for (let i = 0; i < params.length; i++) {
            if (i < args.length) {
                funCtx.scope.define(params[i], args[i])
            }
        }
        const res = body.eval(funCtx)
        return res.is(BReturn) ? res.data : res
    }, name)
}

export class NamedFunExpr implements Expression, ExportableExpr {
    constructor(
        public name: string,
        private params: string[],
        private body: Expression,
    ) {}

    export(exports: Set<string>): void {
        if (exports!.has(this.name)) {
            panic(`Cannot re-export '${this.name}'`)
        }
        exports!.add(this.name)
    }

    eval(ctx: Context) {
        const fun = makeFunction(ctx, this.params, this.body, this.name)
        ctx.scope.define(this.name, fun)
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return `fun ${this.name}(${this.params.join(
            ", ",
        )}) ${this.body.toString(symbol, indent)}`
    }
}

export class FunExpr implements Expression {
    constructor(private params: string[], private body: Expression) {}

    eval(ctx: Context) {
        return makeFunction(ctx, this.params, this.body)
    }

    toString(symbol = "", indent = ""): string {
        return `fun(${this.params.join(", ")}) ${this.body.toString(
            symbol,
            indent,
        )}`
    }
}
