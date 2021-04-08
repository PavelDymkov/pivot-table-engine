import { AggregateFunction } from "./aggregate-function";

export class Range extends AggregateFunction {
    private min = 0;
    private max = 0;

    next(value: any): void {
        this.min = Math.min(this.min, value);
        this.max = Math.max(this.max, value);
    }

    getSummeryValue(): number {
        return this.max - this.min;
    }
}
