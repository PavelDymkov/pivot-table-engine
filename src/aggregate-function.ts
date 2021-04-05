export abstract class AggregateFunction {
    abstract next(value: any): void;
    abstract getSummeryValue(): any;
}

export type AggregateFunctionFactory = () => AggregateFunction;

class Average extends AggregateFunction {
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

export const average: AggregateFunctionFactory = () => new Average();

class Count extends AggregateFunction {
    private quantity = 0;

    next(): void {
        this.quantity += 1;
    }

    getSummeryValue(): number {
        return this.quantity;
    }
}

export const count: AggregateFunctionFactory = () => new Count();

class Group extends AggregateFunction {
    next(): void {}
    getSummeryValue(): any {}
}

export const group: AggregateFunctionFactory = () => new Group();

class Maximum extends AggregateFunction {
    private max = 0;

    next(value: any): void {
        this.max = Math.max(this.max, value);
    }

    getSummeryValue(): number {
        return this.max;
    }
}

export const maximum: AggregateFunctionFactory = () => new Maximum();

class Median extends AggregateFunction {
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

export const median: AggregateFunctionFactory = () => new Median();

class Minimum extends AggregateFunction {
    private min = 0;

    next(value: any): void {
        this.min = Math.min(this.min, value);
    }

    getSummeryValue(): number {
        return this.min;
    }
}

export const minimum: AggregateFunctionFactory = () => new Minimum();

class Mode extends AggregateFunction {
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

export const mode: AggregateFunctionFactory = () => new Mode();

class Range extends AggregateFunction {
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

export const range: AggregateFunctionFactory = () => new Range();

class Sum extends AggregateFunction {
    private accumulate = 0;

    next(value: any): void {
        this.accumulate += value;
    }

    getSummeryValue(): number {
        return this.accumulate;
    }
}

export const sum: AggregateFunctionFactory = () => new Sum();
