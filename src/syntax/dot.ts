import { Context } from "../context"
import { BValue } from "../engine/engine"
import { BObject } from "../engine/prelude"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { ARRAY } from "./array"
import { AssignableExpr } from "./assignable"
import { Expression } from "./expression"
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

    eval(ctx: Context) {
        const args = this.args.map((arg) => arg.eval(ctx))
        return this.object
            .eval(ctx)
            .invoke(ctx.core.engine, this.method, ...args)
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

    assign(ctx: Context, value: BValue): void {
        this.object.eval(ctx).as(BObject).set(this.prop, value)
    }

    eval(ctx: Context) {
        return this.object.eval(ctx).as(BObject).get(this.prop)
    }

    toString(symbol = "", indent = ""): string {
        return `${this.object.toString(symbol, indent)}.${this.prop}`
    }
}
