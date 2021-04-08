import { AggregateFunction } from "./aggregate-function";

export class Sum extends AggregateFunction {
    private accumulate = 0;

    next(value: any): void {
        this.accumulate += value;
    }

    getSummeryValue(): number {
        return this.accumulate;
    }
}
