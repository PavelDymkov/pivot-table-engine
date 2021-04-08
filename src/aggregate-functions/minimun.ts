import { AggregateFunction } from "./aggregate-function";

export class Minimum extends AggregateFunction {
    private min = 0;

    next(value: any): void {
        this.min = Math.min(this.min, value);
    }

    getSummeryValue(): number {
        return this.min;
    }
}
