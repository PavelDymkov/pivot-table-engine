import { AggregateFunction } from "./aggregate-function";

export class Maximum extends AggregateFunction {
    private max = 0;

    next(value: any): void {
        this.max = Math.max(this.max, value);
    }

    getSummeryValue(): number {
        return this.max;
    }
}
