import { not } from "logical-not";

import { Cell } from "./cell";
import { FilterItem } from "./filter";
import { PivotTableTree } from "./pivot-table-tree";
import { PivotTableSetup, Setup } from "./setup";
import { SortItem } from "./sort";
import { Table } from "./table";

const cache = Symbol();
const filters = Symbol();
const setup = Symbol();
const sort = Symbol();
const table = Symbol();

export class PivotTable {
    static createFor(source: Table): PivotTable {
        return Object.assign(new PivotTable(), {
            [table]: source,
        });
    }

    [cache]: PivotTableTree | null = null;
    [filters]: FilterItem[] = [];
    [setup] = new PivotTableSetup();
    [sort]: SortItem[] = [];
    [table]: Table;

    setup(source: Partial<Setup>): void {
        this[setup].update(source, this[table].columns);
        this[cache] = null;
    }

    setFilters(items: FilterItem[]): void {
        this[filters] = items;
        this[cache] = null;
    }

    setSort(items: SortItem[]): void {
        this[sort] = items;

        this[cache]?.changeSort(items);
    }

    // collapse(cell: Cell): void {}

    // expand(cell: Cell): void {}

    // drillDown(cell: Cell): Table {
    //     return Table.create([]);
    // }

    aggregate(): Cell[][] {
        if (not(this[cache]))
            this[cache] = new PivotTableTree(
                this[setup],
                this[table],
                this[filters],
                this[sort],
            );

        return this[cache]!.toCellTable();
    }

    private constructor() {}
}
