import { Cell } from "./cell";
import { FilterItem } from "./filter";
import { PivotTableTree } from "./pivot-table-tree";
import { PivotTableSetup, Setup } from "./setup";
import { SortItem } from "./sort";
import { Table } from "./table";

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

    [filters]: FilterItem[] = [];
    [setup] = new PivotTableSetup();
    [sort]: SortItem[] = [];
    [table]: Table;

    setup(source: Partial<Setup>): void {
        this[setup].update(source, this[table].columns);
    }

    setFilters(items: FilterItem[]): void {
        this[filters] = items;
    }

    setSort(items: SortItem[]): void {
        this[sort] = items;
    }

    // collapse(cell: Cell): void {}

    // expand(cell: Cell): void {}

    // drillDown(cell: Cell): Table {
    //     return Table.create([]);
    // }

    aggregate(): Cell[][] {
        const pivotTableTree = new PivotTableTree(
            this[setup],
            this[table],
            this[filters],
            this[sort],
        );

        return pivotTableTree.toCellTable();
    }

    private constructor() {}
}
