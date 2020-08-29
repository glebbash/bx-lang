import { Token } from '../tokenizer';
import { panic } from './panic';

export class SyntaxError extends Error {
    constructor(message: string, private position: Token["start"]) {
        super(message)
    }

    toString() {
        return `Syntax error: ${this.message}\n    at ${this.position}`
    }
}

export function syntaxError(message: string, position: Token["start"]): never {
    panic(new SyntaxError(message, position))
}
