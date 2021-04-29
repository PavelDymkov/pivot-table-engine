import { FilterItem } from "../filter";
import { PivotTableSetup } from "../pivot-table-setup";
import { PivotTableView } from "../pivot-table-view";
import { SortItem } from "../sort";
import { Table } from "../table";
import { createPivotTableView } from "./create-pivot-table-view";
import { FiltersSetup } from "./filters-setup";
import { NodeTitle } from "./node-title";
import { PivotTableSource } from "./pivot-table-source";
import { SortSetup } from "./sort-setup";

export function aggregate(
    table: Table,
    setup: PivotTableSetup,
    filters: FilterItem[],
    sort: SortItem[],
): PivotTableView {
    const pivotTableSource = PivotTableSource.create(
        table,
        setup,
        new FiltersSetup(filters, setup),
    );

    pivotTableSource.sort(new SortSetup(sort, setup));

    console.log(pivotTableSource);

    return pivotTableSource.createPivotTable();
}
