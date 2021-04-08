import { AggregateFunction } from "./aggregate-function";

export class Count extends AggregateFunction {
    private quantity = 0;

    next(): void {
        this.quantity += 1;
    }

    getSummeryValue(): number {
        return this.quantity;
    }
}
