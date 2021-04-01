import { AggregateFunctionFactory } from "./aggregate-function";
import { Aggregator } from "./aggregator";
import { Filter, Sort } from "./data";
import { Filter as FilterInternal, filters as filtersMap } from "./filters";
import { PivotTableSetup, Setup } from "./pivot-table-setup";
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

    [filters]: FilterInternal[] = [];
    [setup] = new PivotTableSetup();
    [sort]: Sort[] = [];
    [table]: Table;

    setup(source: Partial<Setup>): void {
        this[setup].update(source, this[table].columns);
    }

    setFilters(items: Filter[]): void {
        this[filters] = [];

        items?.forEach(({ type, column, value }) => {
            const getFilter = filtersMap[type];

            if (getFilter) this[filters].push(getFilter(column, value));
        });
    }

    setSort(items: Sort[]): void {
        this[sort] = [];

        items?.forEach(item => this[sort].push(item));
    }

    aggregate(
        aggregateFunctions: Record<number, AggregateFunctionFactory> = {},
    ): any {
        const aggregator = new Aggregator(
            this[table],
            this[setup],
            aggregateFunctions,
        );

        aggregator.init();

        if (this[filters].length > 0) aggregator.filter(this[filters]);
        if (this[sort].length > 0) aggregator.sort(this[sort]);

        return aggregator.aggregate();
    }

    private constructor() {}
}
