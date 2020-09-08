import { Context } from "../context"
import { BValue } from "../engine/engine"
import { BObject, VOID } from "../engine/prelude"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { ARRAY } from "./array"
import { AssignableExpr } from "./assignable"
import { seq } from "./block"
import { Callback, Expression } from "./expression"
import { expectIdent } from "./ident"
import { postfixParser } from "./postfix-op"

export const dot = (precedence: number) =>
    postfixParser(
        precedence,
        (parser: Parser, _token: Token, obj: Expression) => {
            const name = expectIdent(parser, true).name
            if (parser.nextIs({ type: "block_paren" })) {
                return new MethodCallExpr(
                    name,
                    obj,
                    ARRAY(parser, parser.next()).items,
                )
            }
            return new PropExpr(name, obj)
        },
    )

export class MethodCallExpr implements Expression {
    constructor(
        private method: string,
        private object: Expression,
        private args: Expression[],
    ) {}

    eval(ctx: Context, cb: Callback) {
        const args: BValue[] = []
        seq(
            ctx,
            this.args,
            (val, err, next) => {
                if (err) return cb(VOID, err)
                args.push(val)
                next()
            },
            () => {
                this.object.eval(ctx, (obj, err) => {
                    if (err) return cb(VOID, err)
                    obj.invoke(ctx.core.engine, this.method, cb, ...args)
                })
            },
        )
    }

    toString(symbol = "", indent = ""): string {
        return `${this.object}.${this.method}(${this.args
            .map((it) => it.toString(symbol, indent))
            .join(", ")})`
    }
}

export class PropExpr extends AssignableExpr {
    constructor(private prop: string, private object: Expression) {
        super()
    }

    isDefinable() {
        return false
    }

    assign(ctx: Context, value: BValue, cb: (error?: Error) => void): void {
        this.object.eval(ctx, (obj, err) => {
            if (err) return cb(err)
            obj.as(BObject).set(this.prop, value)
            cb()
        })
    }

    eval(ctx: Context, cb: Callback) {
        this.object.eval(ctx, (res, err) => {
            if (err) return cb(VOID, err)
            cb(res.as(BObject).get(this.prop))
        })
    }

    toString(symbol = "", indent = ""): string {
        return `${this.object.toString(symbol, indent)}.${this.prop}`
    }
}
