import { Atom, Context, Expression, ExprParser } from "../core"
import { BValue } from "../engine/engine"
import { BBreak, BContinue, BReturn, VOID } from "../engine/prelude"
import { Token, Tokens } from "../lexer"

export function blockOrExpr(parser: ExprParser): Expression {
    return isBlock(parser.next(false)) ? expectBlock(parser) : parser.parse()
}
export function isBlock(token: Token): boolean {
    return token.type === "block_brace" || token.type === "block_indent"
}

export function expectBlock(parser: ExprParser): BlockExpr {
    const token = parser.next()

    return isBlock(token) ? BLOCK(parser, token) : parser.unexpectedToken(token)
}

export const BLOCK: Atom<BlockExpr> = (parser: ExprParser, token: Token) => {
    const exprs = token.value as Tokens[]
    return new BlockExpr(
        exprs.map((expr) => parser.subParser(expr).parseToEnd()),
    )
}

export class BlockExpr implements Expression {
    constructor(private body: Expression[]) {}

    eval(ctx: Context) {
        let res: BValue = VOID
        for (const expr of this.body) {
            res = expr.eval(ctx)
            if (res.is(BReturn) || res.is(BBreak) || res.is(BContinue)) {
                return res
            }
        }
        return res
    }

    toString(symbol = "", indent = ""): string {
        const bodyIndent = this.body.length > 1 ? indent + symbol : ""
        return `${indent}{\n${this.body
            .map((it) => it.toString(symbol, bodyIndent))
            .join("\n")}\n${indent}}`
    }
}
