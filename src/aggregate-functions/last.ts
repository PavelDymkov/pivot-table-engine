import { AggregateFunction } from "./aggregate-function";

export class Last extends AggregateFunction {
    private value: any;

    next(value: any): void {
        this.value = value;
    }

    getSummeryValue(): number {
        return this.value;
    }
}
