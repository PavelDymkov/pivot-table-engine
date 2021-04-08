import { AggregateFunction } from "./aggregate-function";

export class Average extends AggregateFunction {
    private accumulate = 0;
    private quantity = 0;

    next(value: any): void {
        this.accumulate += value;
        this.quantity += 1;
    }

    getSummeryValue(): number {
        return this.accumulate / this.quantity;
    }
}
