import { FilterType } from "./data";

export abstract class Filter {
    constructor(readonly column: number, values: any | any[]) {
        this.init(values);
    }

    abstract check(value: any): boolean;

    protected init(sourceValues: any | any[]): void {}
}

export class FilterEqual extends Filter {
    static create(column: number, values: any[]): FilterEqual {
        return new FilterEqual(column, values);
    }

    private value: any;

    check(value: any): boolean {
        return value === this.value;
    }

    protected init(source: any) {
        this.value = source;
    }
}

export const filters: Record<
    FilterType,
    (column: number, values: any[]) => Filter
> = {
    [FilterType.Equal]: FilterEqual.create,
};
