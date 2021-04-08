import { not } from "logical-not";

import { FilterItem } from "../filter";
import { PivotTableSetup } from "../pivot-table-setup";
import { PivotTableView } from "../pivot-table-view";
import { SortItem } from "../sort";
import { Table } from "../table";
import { createPivotTableView } from "./create-pivot-table-view";
import { NodeTitle, NodeTitleTouchType } from "./node-title";
import { AttachGroups, NodeValue } from "./node-value";
import { SortSetup } from "./sort-setup";

export function aggregate(
    table: Table,
    setup: PivotTableSetup,
    filters: FilterItem[],
    sort: SortItem[],
): PivotTableView {
    const sortSetup = new SortSetup(sort, setup);
    const values = NodeValue.createNodeValues(
        table,
        setup,
        filters,
        sortSetup.values.length > 1,
    );

    const [columns, rows] =
        sortSetup.values.length > 0
            ? createAndSortValues(values, setup, sortSetup)
            : createAndSort(values, setup, sortSetup);

    return createPivotTableView(
        NodeTitle.toExtended(columns),
        NodeTitle.toExtended(rows),
        values,
    );
}

function createAndSort(
    values: NodeValue[],
    setup: PivotTableSetup,
    sortSetup: SortSetup,
): [NodeTitle[], NodeTitle[]] {
    const [columns, rows] = create(values, setup, NodeTitleTouchType.Aggregate);

    if (sortSetup.columns.length > 0)
        NodeTitle.sort(columns, sortSetup.columns);

    if (sortSetup.rows.length > 0) NodeTitle.sort(rows, sortSetup.rows);

    return [columns, rows];
}

function createAndSortValues(
    values: NodeValue[] & AttachGroups,
    setup: PivotTableSetup,
    sortSetup: SortSetup,
): [NodeTitle[], NodeTitle[]] {
    sortSetup.rows.forEach(sortItem => {
        const i = setup.rows.findIndex(column => sortItem.column);

        if (i === -1) return;

        values.sort((a, b) => sortItem.sorter.compare(a.path[i], b.path[i]));
    });

    if (sortSetup.values.length === 1) {
        const [{ sorter }] = sortSetup.values;

        values.sort((a, b) => sorter.compare(a.value, b.value));
    } else {
    }

    const [columns, rows] = create(values, setup, NodeTitleTouchType.Addition);

    if (sortSetup.columns.length > 0)
        NodeTitle.sort(columns, sortSetup.columns);

    return [columns, rows];
}

function create(
    values: NodeValue[],
    setup: PivotTableSetup,
    rowsTouchType: NodeTitleTouchType,
): [NodeTitle[], NodeTitle[]] {
    const rows = NodeTitle.Root;
    const columns = NodeTitle.Root;

    const setupRows = setup.rows;
    const setupColumns = setup.columns;

    const rowsStart = 0;
    const rowsEnd = setupRows.length;
    const columnsStart = rowsEnd;
    const columnsEnd =
        columnsStart + setupColumns.length + (setup.values.length > 1 ? 1 : 0);

    values.forEach(({ path }) => {
        rows.touch(
            path
                .slice(rowsStart, rowsEnd)
                .map((value, i) => ({ column: setupRows[i], value })),
            rowsTouchType,
        );
        columns.touch(
            path.slice(columnsStart, columnsEnd).map((value, i) => ({
                column: setupColumns[i] || setup.getColumnByKey(value),
                value,
                label:
                    typeof value === "symbol"
                        ? setup.getValueLabel(value)
                        : value,
            })),
            NodeTitleTouchType.Aggregate,
        );
    });

    return [columns.children, rows.children];
}
