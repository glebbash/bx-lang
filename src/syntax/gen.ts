import { Atom, Context, Expression, ExprParser, subContext } from "../core"
import { BValue } from "../engine/engine"
import { BFunction, BGenerator, VOID } from "../engine/prelude"
import { panic } from "../utils/panic"
import { syntaxError } from "../utils/syntax-error"
import { ARRAY } from "./array"
import { BlockExpr, blockOrExpr } from "./block"
import { ExportableExpr } from "./export"
import { IDENT, IdentExpr } from "./ident"

export const GEN: Atom<GenFunExpr | NamedGenFunExpr> = (parser: ExprParser) => {
    parser.expect({ value: "fun" })
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
    const fun = new GenFunExpr(params, body)

    return name === null ? fun : new NamedGenFunExpr(name, fun)
}

export class NamedGenFunExpr implements Expression, ExportableExpr {
    constructor(public name: string, private fun: GenFunExpr) {}

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
        return `gen fun ${this.name}(${this.fun.params.join(
            ", ",
        )}) ${this.fun.body.toString(symbol, indent)}`
    }
}

export class GenFunExpr implements Expression {
    constructor(public params: string[], public body: BlockExpr) {}

    eval(ctx: Context) {
        return new BFunction((...args: BValue[]) => {
            const genCtx = subContext(ctx)
            const pLen = this.params.length
            const aLen = args.length
            for (let i = 0; i < pLen; i++) {
                if (i < aLen) {
                    genCtx.scope.define(this.params[i], args[i])
                }
            }
            return new BGenerator(genCtx, this.body)
        })
    }

    toString(symbol = "", indent = ""): string {
        return `gen fun(${this.params.join(", ")}) ${this.body.toString(
            symbol,
            indent,
        )}`
    }
}
