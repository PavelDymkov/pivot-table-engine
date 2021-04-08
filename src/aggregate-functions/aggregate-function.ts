export abstract class AggregateFunction {
    abstract next(value: any): void;
    abstract getSummeryValue(): any;
}
