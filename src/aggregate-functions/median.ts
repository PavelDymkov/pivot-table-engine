import { AggregateFunction } from "./aggregate-function";

export class Median extends AggregateFunction {
    private values = [] as any[];

    next(value: any): void {
        this.values.push(value);
    }

    getSummeryValue(): any {
        this.values.sort();

        const i = Math.floor(this.values.length / 2);

        return this.values[i];
    }
}
