import { Blocks } from "../core";

export interface Expression {
    eval(core: Blocks): any

    print(): string
}
