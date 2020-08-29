import { Blocks } from '../core';
import { Scope } from '../engine/scope';

export interface Expression {
    eval(scope: Scope): any

    print(): string
}
