import { FilterItem } from "../filter";
import { PivotTableSetup } from "../pivot-table-setup";
import { IS_ID, parseId, PivotTableView } from "../pivot-table-view";
import { SortItem } from "../sort";
import { Table } from "../table";
import { createPivotTableView } from "./create-pivot-table-view";
import { FiltersSetup } from "./filters-setup";
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
    const createGroups = sortSetup.values.length > 0;
    const values = NodeValue.createNodeValues(
        table,
        setup,
        new FiltersSetup(filters, setup),
        createGroups,
    );

    const [columns, rows] = createGroups
        ? createAndSortValues(values, setup, sortSetup)
        : createAndSort(values, setup, sortSetup);

    return createPivotTableView(
        NodeTitle.toExtended(columns),
        NodeTitle.toExtended(rows),
        values,
        setup,
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
    if (values.groups) {
        sortSetup.rows.forEach(({ column, sorter }) => {
            const i = setup.rows.indexOf(column);

            if (i !== -1)
                values.groups!.sort((a, b) =>
                    sorter.compare(a[0].path[i], b[0].path[i]),
                );
        });

        sortSetup.values.forEach(({ column, sorter }) => {
            const { key } = setup.values.find(item => item.index === column)!;

            values.groups!.sort((a, b) => {
                const itemA = a.find(
                    item => item.path[item.path.length - 1] === key,
                )!;
                const itemB = b.find(
                    item => item.path[item.path.length - 1] === key,
                )!;

                return sorter.compare(itemA.value, itemB.value);
            });
        });

        NodeValue.ungroup(values);
    } else {
        sortSetup.rows.forEach(({ column, sorter }) => {
            const i = setup.rows.indexOf(column);

            if (i !== -1)
                values.sort((a, b) => sorter.compare(a.path[i], b.path[i]));
        });

        sortSetup.values.forEach(({ sorter }) => {
            values.sort((a, b) => sorter.compare(a.value, b.value));
        });
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
        const rowsPathArray = path.slice(rowsStart, rowsEnd);
        const columnsPathArray = path.slice(columnsStart, columnsEnd);

        rows.touch(
            rowsPathArray.map((value, i) => ({
                column: setupRows[i],
                value,
                connectTo: columnsPathArray,
            })),
            rowsTouchType,
        );
        columns.touch(
            columnsPathArray.map((value, i) => ({
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
