import { Context } from "../context"
import { BValue } from "../engine/engine"
import { BFunction, BObject, VOID } from "../engine/prelude"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { ARRAY } from "./array"
import { seq } from "./block"
import { Callback, Expression } from "./expression"
import { expectIdent } from "./ident"
import { postfixParser } from "./postfix-op"

export const doubleSemi = (precedence: number) =>
    postfixParser(
        precedence,
        (parser: Parser, _token: Token, obj: Expression) => {
            const name = expectIdent(parser, true).name
            if (parser.nextIs({ type: "block_paren" })) {
                return new PropCallExpr(
                    name,
                    obj,
                    ARRAY(parser, parser.next()).items,
                )
            }
            return new MethodGetExpr(name, obj)
        },
    )

export class PropCallExpr implements Expression {
    constructor(
        private name: string,
        private object: Expression,
        private args: Expression[],
    ) {}

    eval(ctx: Context, cb: Callback) {
        this.object.eval(ctx, (objV, err) => {
            if (err) return cb(VOID, err)
            const obj = objV.as(BObject)
            const fun = obj.get(this.name).as(BFunction)
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
                    fun.call(cb, ...args)
                },
            )
        })
    }

    toString(symbol = "", indent = ""): string {
        return `${this.object}::${this.name}(${this.args
            .map((it) => it.toString(symbol, indent))
            .join(", ")})`
    }
}

export class MethodGetExpr implements Expression {
    constructor(private prop: string, private object: Expression) {}

    eval(ctx: Context, cb: Callback) {
        this.object.eval(ctx, (res, err) => {
            if (err) return cb(VOID, err)
            cb(res.as(BObject).get(this.prop))
        })
    }

    toString(symbol = "", indent = ""): string {
        return `${this.object.toString(symbol, indent)}::${this.prop}`
    }
}
