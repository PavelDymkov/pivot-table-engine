import { not } from "logical-not";

import { AggregateFunction } from "./aggregate-function";

export class First extends AggregateFunction {
    private value: any;
    private hasValue = false;

    next(value: any): void {
        if (not(this.hasValue)) {
            this.value = value;
            this.hasValue = true;
        }
    }

    getSummeryValue(): number {
        return this.value;
    }
}
