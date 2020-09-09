import { Atom, Context, Expression, ExprParser } from "../core"
import { BValue } from "../engine/engine"
import {
    BBreak,
    BContinue,
    BPausedExec,
    BReturn,
    BPause,
    ExecState,
    VOID,
} from "../engine/prelude"
import { Token, Tokens } from "../lexer"

export function blockOrExpr(parser: ExprParser): BlockExpr {
    return isBlock(parser.next(false))
        ? expectBlock(parser)
        : new BlockExpr([parser.parse()])
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

export class BlockExecState implements ExecState {
    constructor(
        private ctx: Context,
        private block: BlockExpr,
        private line: number,
    ) {}

    resume(value?: BValue): BValue {
        return this.block.eval(this.ctx, this.line, value)
    }
}

export class BlockExpr implements Expression {
    constructor(private body: Expression[]) {}

    eval(ctx: Context, line = 0, res: BValue = VOID) {
        for (const len = this.body.length; line < len; line++) {
            const expr = this.body[line]
            res = expr.eval(ctx)
            if (res.is(BPause)) {
                return new BPausedExec({
                    returned: res.data,
                    execStack: [new BlockExecState(ctx, this, line + 1)],
                })
            } else if (res.is(BPausedExec)) {
                res.data.execStack.unshift(new BlockExecState(ctx, this, line + 1))
                return res
            }
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
