import { aggregate } from "./aggregate";
import { FilterItem } from "./filter";
import { PivotTableSetup, Setup } from "./pivot-table-setup";
import { SortItem } from "./sort";
import { PivotTableView } from "./pivot-table-view";
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

    aggregate(): PivotTableView {
        return aggregate(this[table], this[setup], this[filters], this[sort]);
    }

    private constructor() {}
}
