import { BHolder, BValue } from './engine';

export class BNumber extends BHolder<number> {}

export class BString extends BHolder<string> {
    toString() {
        return `"${this.data}"`
    }
}

export class BVoid extends BValue {
    toString() {
        return "void"
    }
}
