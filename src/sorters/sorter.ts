export type Comparison = -1 | 0 | 1;

export abstract class Sorter {
    abstract compare(a: any, b: any): Comparison;
}
