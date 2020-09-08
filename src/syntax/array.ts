import { Context } from "../context"
import { BValue } from "../engine/engine"
import { BArray, VOID } from "../engine/prelude"
import { Expr, Token } from "../lexer"
import { Parser } from "../parser"
import { panic } from "../utils/panic"
import { AssignableExpr } from "./assignable"
import { seq } from "./block"
import { Callback, Expression } from "./expression"
import { IdentExpr } from "./ident"
import { PrefixParser } from "./prefix-op"

export const ARRAY: PrefixParser<ArrayExpr> = (
    parser: Parser,
    token: Token,
) => {
    const exprs = token.value as Expr[]
    const items: Expression[] = []
    for (const expr of exprs) {
        const subParser = parser.subParser(expr)
        while (subParser.nextToken(false) !== null) {
            items.push(subParser.parse())
            if (subParser.nextToken(false) !== null) {
                subParser.expect({ value: "," })
            }
        }
    }
    return new ArrayExpr(items)
}

export class ArrayExpr extends AssignableExpr {
    constructor(public items: Expression[]) {
        super()
    }

    isValid() {
        return this.items.every((item) => item instanceof IdentExpr)
    }

    define(ctx: Context, value: BValue, constant: boolean) {
        if (value === VOID) {
            for (const ident of this.items as IdentExpr[]) {
                ctx.scope.define(ident.name, VOID, constant)
            }
            return
        }
        const arr = value.as(BArray).data
        if (this.items.length > arr.length) {
            panic(
                `Trying to assign ${arr.length} element(s) to ${this.items.length} name(s)`,
            )
        }
        let i = 0
        for (; i < this.items.length; i++) {
            const name = (this.items[i] as IdentExpr).name
            const val = arr[i]
            ctx.scope.define(name, val, constant)
        }
        // TODO: varags
    }

    assign(ctx: Context, value: BValue): void {
        const arr = value.as(BArray).data
        if (this.items.length > arr.length) {
            panic(
                `Trying to assign ${arr.length} element(s) to ${this.items.length} name(s)`,
            )
        }
        let i = 0
        for (; i < this.items.length; i++) {
            const name = (this.items[i] as IdentExpr).name
            const val = arr[i]
            ctx.scope.set(name, val)
        }
        // TODO: varags
        // if (vararg !== null && i < arr.length - 1) {
        //     ctx.scope.define(name, new BArray(arr.slice(i)), this.constant)
        // }
    }

    eval(ctx: Context, cb: Callback) {
        const arr: BValue[] = []
        seq(
            ctx,
            this.items,
            (val, err, next) => {
                if (err) return cb(VOID, err)
                arr.push(val)
                next()
            },
            () => cb(new BArray(arr)),
        )
    }

    toString(symbol = "", indent = ""): string {
        return (
            indent +
            "[" +
            this.items.map((it) => it.toString(symbol)).join(", ") +
            "]"
        )
    }
}
