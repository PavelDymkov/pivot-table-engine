import { Comparison, Sorter } from "./sorter";

export class ZA extends Sorter {
    compare(a: any, b: any): Comparison {
        if (a === b) return 0;

        return a < b ? 1 : -1;
    }
}
