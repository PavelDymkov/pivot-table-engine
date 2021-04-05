export function sort(column: number, order: SortOrder): SortItem {
    return new SortItem(column, order);
}

export class SortItem {
    constructor(public column: number, public order: SortOrder) {}
}

export enum SortOrder {
    AZ,
    ZA,
}
