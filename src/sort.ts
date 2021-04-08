import { Sorter } from "./sorters";

export function sort(column: number, sorter: Sorter): SortItem {
    return new SortItem(column, sorter);
}

export class SortItem {
    constructor(public column: number, public sorter: Sorter) {}
}
