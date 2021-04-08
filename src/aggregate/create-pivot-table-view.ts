import { not } from "logical-not";

import { Cell, PivotTableView } from "../pivot-table-view";
import { NodeTitleExtended } from "./node-title-extended";
import { NodeValue } from "./node-value";

export function createPivotTableView(
    columns: NodeTitleExtended[],
    rows: NodeTitleExtended[],
    values: NodeValue[],
): PivotTableView {
    const pivotTableRows: Cell[][] = [];
    const pivotTableColumns: Cell[][] = [];
    const pivotTableValues: any[][] = [];

    NodeTitleExtended.iterate(columns, ({ offset, deep, label, span }) => {
        if (label)
            push(pivotTableColumns, deep, offset, new Cell(label, span, 1));
    });

    NodeTitleExtended.iterate(rows, ({ offset, deep, value, span }) =>
        push(pivotTableRows, offset, deep, new Cell(value, 1, span)),
    );

    // console.log(rows);

    values.forEach(({ path, value }) => {
        path = path.slice();
        console.log(path);

        const rowNode = NodeTitleExtended.find(rows, (node): boolean => {
            if (node.value === path[0]) {
                path.shift();

                return true;
            }

            return false;
        });

        const columnNode = NodeTitleExtended.find(columns, (node): boolean => {
            if (node.value === path[0]) {
                path.shift();

                return true;
            }

            return false;
        });

        if (rowNode && columnNode)
            console.log(rowNode?.offset, columnNode?.offset);

        if (rowNode && columnNode)
            push(pivotTableValues, rowNode.offset, columnNode.offset, value);
    });

    const length = columns.reduce(
        (accumulate, { span }) => accumulate + span,
        0,
    );

    pivotTableValues.forEach(row => {
        for (let i = 0; i < length; i++) if (not(i in row)) row[i] = NaN;
    });

    return new PivotTableView(
        pivotTableColumns,
        pivotTableRows,
        pivotTableValues,
        {
            colspan: pivotTableRows[0]?.length || 0,
            rowspan: pivotTableColumns.length,
        },
    );
}

function push(array: any[][], row: number, column: number, value: any): void {
    if (not(row in array)) array[row] = [] as any[];

    array[row][column] = value;
}
