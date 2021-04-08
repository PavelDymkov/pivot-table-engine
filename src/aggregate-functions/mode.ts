import { AggregateFunction } from "./aggregate-function";

export class Mode extends AggregateFunction {
    private map = new Map<any, number>();

    next(value: any): void {
        const n = this.map.get(value) || 0;

        this.map.set(value, n + 1);
    }

    getSummeryValue(): any {
        let value;
        let frequence = 0;

        this.map.forEach((currentValue, currentFrequence) => {
            if (currentFrequence > frequence) {
                value = currentValue;
                frequence = currentFrequence;
            }
        });

        return value;
    }
}
