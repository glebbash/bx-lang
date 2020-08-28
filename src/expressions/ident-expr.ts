import { Blocks } from "../core";
import { Expression } from "./expression";

export class IdentExpr implements Expression {
    constructor(public name: string) {}

    eval(core: Blocks) {
        return core.engine.scope.get(this.name)
    }
    
    print() {
        return this.name
    }

}