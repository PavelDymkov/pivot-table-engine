import { not } from "logical-not";
import { PivotTableSetup } from "../pivot-table-setup";

import { Cell, PivotTableView } from "../pivot-table-view";
import { NodeTitleExtended } from "./node-title-extended";
import { NodeValue } from "./node-value";

export function createPivotTableView(
    columns: NodeTitleExtended[],
    rows: NodeTitleExtended[],
    values: NodeValue[],
    setup: PivotTableSetup,
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

    const separator = setup.rows.length;

    values.forEach(({ path, value }) => {
        let row = 0;
        let column = 0;

        const rowsPathArray = path.slice(0, separator);
        const columnsPathArray = path.slice(separator);

        if (rowsPathArray.length > 0) {
            const rowNode = NodeTitleExtended.find(rows, (node): boolean => {
                if (node.value === rowsPathArray[node.deep]) {
                    if (node.deep === rowsPathArray.length - 1) {
                        const isConnected =
                            node.connectTo?.some((items: any[]) =>
                                items.every(
                                    (value, i) => columnsPathArray[i] === value,
                                ),
                            ) || false;

                        return isConnected;
                    }

                    return true;
                }

                return false;
            });

            if (rowNode) row = rowNode.offset;
        }

        if (columnsPathArray.length > 0) {
            const columnNode = NodeTitleExtended.find(
                columns,
                node => node.value === columnsPathArray[node.deep],
            );

            if (columnNode) column = columnNode.offset;
        }

        push(pivotTableValues, row, column, value);
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
