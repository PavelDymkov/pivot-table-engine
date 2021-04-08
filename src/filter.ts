import { Filter } from "./filters/filter";

export function filter(column: number, filter: Filter): FilterItem {
    return new FilterItem(column, filter);
}

export class FilterItem {
    constructor(public column: number, public filter: Filter) {}
}
