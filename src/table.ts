import { FilterItem } from "./filter";
import { Column } from "./schema";
import { SortItem } from "./sort";

const filters = Symbol();
const schema = Symbol();
const sort = Symbol();
const value = Symbol();

export class Table {
    static create(source: Column[]): Table {
        return Object.assign(new Table(), {
            [schema]: source,
            [value]: [],
        });
    }

    [filters]: FilterItem[] = [];
    [schema]: Column[];
    [sort]: SortItem[] = [];
    [value]: any[][];

    get columns(): number {
        return this[schema].length;
    }

    get rows(): number {
        return this[value].length;
    }

    addRows(rows: any[][]): void {
        rows.forEach(source => {
            const row = this[schema].map((type, i) => type.parse(source[i]));

            this[value].push(row);
        });
    }

    setFilters(items: FilterItem[]): void {
        this[filters] = items;
    }

    setSort(items: SortItem[]): void {
        this[sort] = items;
    }

    getRow(index: number): any[] {
        return (
            this[value][index] || this[schema].map(item => item.defaultValue)
        );
    }

    getValue(column: number, row: number): any {
        return this.getRow(row)[column];
    }

    getLabel(column: number, row: number): any {
        return this[schema][column].toString(this.getValue(column, row));
    }

    getSchema(i: number): Column {
        return this[schema][i];
    }

    private constructor() {}
}
