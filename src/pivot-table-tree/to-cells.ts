import { Cell } from "../cell";
import { PivotTableTree } from "./pivot-table-tree";
import { createPivotTableView } from "./pivot-table-view";

export function toCells(pivotTableTree: PivotTableTree): Cell[][] {
    const pivotTableView = createPivotTableView(pivotTableTree);

    const { setup } = pivotTableTree;

    console.log(pivotTableView);

    const rows: CellSource[][] = [];

    const { columns: offsetColumns, rows: offsetRows } = pivotTableView.offset;

    const valuesQuantity = setup.values.length;

    createColumnsHeader: {
        const serviceRow: CellSource[] = [];

        for (let i = 0, lim = setup.columns.length; i < lim; i++) rows.push([]);

        pivotTableView.columns.forEach((item, rowIndex) =>
            item.forEach((label, columnIndex) => {
                if (serviceRow[columnIndex]?.label !== label) {
                    serviceRow[columnIndex] = rows[columnIndex][
                        rowIndex * valuesQuantity + offsetColumns
                    ] = CellSource.createHeaderCell(label, valuesQuantity, 1);

                    serviceRow.length = columnIndex + 1;
                } else serviceRow[columnIndex].colspan += valuesQuantity;
            }),
        );

        if (setup.showValuesLabels) {
            const labels: CellSource[] = setup.values.map(({ label }) =>
                CellSource.createHeaderCell(label, 1, 1),
            );
            const row: CellSource[] = Array(offsetColumns);

            for (let i = 0, lim = pivotTableView.columns.length; i < lim; i++)
                row.push(...labels);

            rows.push(row);
        }

        if (offsetRows > 0)
            rows[0][0] = CellSource.createHeaderCell(
                "",
                offsetRows,
                offsetColumns,
            );
    }

    if (pivotTableView.rows.length > 0) {
        const serviceRow: CellSource[] = [];
        const valuesOffset = setup.rows.length;
        const length =
            valuesQuantity * pivotTableView.columns.length + valuesOffset;

        pivotTableView.rows.forEach((rowItem, rowIndex) => {
            const row = Array(length).fill(
                CellSource.emptyContent,
                valuesOffset,
            );

            rows.push(row);

            rowItem.forEach((label, columnIndex) => {
                if (serviceRow[columnIndex]?.label !== label) {
                    row[columnIndex] = serviceRow[
                        columnIndex
                    ] = CellSource.createHeaderCell(label, 1, 1);

                    serviceRow.length = columnIndex + 1;
                } else serviceRow[columnIndex].rowspan += 1;
            });

            pivotTableView.values[rowIndex].forEach(
                (label, i) =>
                    (row[i + valuesOffset] = CellSource.createContentCell(
                        label,
                    )),
            );
        });
    } else {
        const length = valuesQuantity * pivotTableView.columns.length;

        pivotTableView.values.forEach(valuesRow => {
            const row = Array(length).fill(CellSource.emptyContent);

            rows.push(row);

            valuesRow.forEach(
                (label, i) => (row[i] = CellSource.createContentCell(label)),
            );
        });
    }

    return CellSource.toCellTable(rows);
}

type PartialWritable<T, WritableKeys extends keyof T> = {
    -readonly [Property in WritableKeys]: T[Property];
} &
    { readonly [Property in Exclude<keyof T, WritableKeys>]: T[Property] };

class CellSource implements PartialWritable<Cell, "colspan" | "rowspan"> {
    static readonly emptyContent = new CellSource(Cell.Type.Content, "", 1, 1);

    static toCellTable(source: CellSource[][]): Cell[][] {
        return source.map(row => row.map(item => item.toCell()));
    }

    static createHeaderCell(
        label: Cell["label"],
        colspan: Cell["colspan"],
        rowspan: Cell["rowspan"],
    ): CellSource {
        return new CellSource(Cell.Type.Header, label, colspan, rowspan);
    }

    static createContentCell(label: string): CellSource {
        return new CellSource(Cell.Type.Content, label, 1, 1);
    }

    constructor(
        public readonly type: Cell["type"],
        public readonly label: Cell["label"],
        public colspan: Cell["colspan"],
        public rowspan: Cell["rowspan"],
    ) {}

    toCell(): Cell {
        return new Cell(this.type, this.label, this.colspan, this.rowspan);
    }
}
