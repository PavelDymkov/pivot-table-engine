import { FilterItem } from "./filter";
import { Column } from "./schema";
import { SortItem } from "./sort";

const filters = Symbol();
const schema = Symbol();
const sort = Symbol();
const source = Symbol();
const table = Symbol();

export class Table {
    static create(source: Column[]): Table {
        return Object.assign(new Table(), {
            [schema]: source,
        });
    }

    [filters]: FilterItem[] = [];
    [schema]: Column[];
    [sort]: SortItem[] = [];
    [source]: any[][] = [];
    [table]: any[][] = [];

    get columns(): number {
        return this[schema].length;
    }

    get rows(): number {
        return this[table].length;
    }

    setFilters(items: FilterItem[]): void {
        this[filters] = items.filter(inSchema, this);

        if (this[source].length > 0) reset.call(this);
    }

    setSort(items: SortItem[]): void {
        this[sort] = items.filter(inSchema, this);

        if (this[source].length > 0) reset.call(this);
    }

    addRows(rows: any[][]): void {
        rows.forEach(rowSource => {
            const row = this[schema].map((type, i) => type.parse(rowSource[i]));

            this[source].push(row);

            for (let i = 0, lim = this[filters].length; i < lim; i++) {
                const { column, filter } = this[filters][i];

                if (filter.check(row[column])) continue;
                else return;
            }

            let rowIndex = this[table].length;

            iterating: for (let i = 0, lim = this[sort].length; i < lim; i++) {
                const { column, sorter } = this[sort][i];

                while (rowIndex > 0) {
                    const prevRow = this[table][rowIndex - 1];

                    for (let j = 0; j < i; j++) {
                        const { column, sorter } = this[sort][j];

                        if (sorter.compare(row[column], prevRow[column]) !== 0)
                            break iterating;
                    }

                    if (sorter.compare(row[column], prevRow[column]) !== -1)
                        break;
                    else rowIndex -= 1;
                }
            }

            this[table].splice(rowIndex, 0, row);
        });
    }

    getRow(index: number): any[] {
        return (
            this[table][index] || this[schema].map(item => item.defaultValue)
        );
    }

    getValue(column: number, row: number): any {
        return this.getRow(row)[column];
    }

    getSchema(column: number): Column {
        return this[schema][column];
    }

    private constructor() {}
}

function inSchema(this: Table, { column }: { column: number }): boolean {
    return column in this[schema];
}

function reset(this: Table): void {
    const sourceTable = this[source];

    this[source] = [];
    this[table] = [];

    this.addRows(sourceTable);
}
