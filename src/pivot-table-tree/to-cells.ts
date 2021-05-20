import { Cell } from "../cell";
import { PivotTableTree } from "./pivot-table-tree";
import { createPivotTableView } from "./pivot-table-view";

export function toCells(pivotTableTree: PivotTableTree): Cell[][] {
    const pivotTableView = createPivotTableView(pivotTableTree);

    const { setup } = pivotTableTree;

    const rows: CellSource[][] = [];

    const { columns: offsetColumns, rows: offsetRows } = pivotTableView.offset;

    const valuesQuantity = setup.values.length;

    if (setup.columns.length > 0) {
        const serviceRow: CellSource[] = [];

        for (let i = 0, lim = setup.columns.length; i < lim; i++) rows.push([]);

        const valuesLabelsRow: CellSource[] = Array(offsetRows);

        if (setup.showValuesLabels) rows.push(valuesLabelsRow);

        pivotTableView.columns.forEach((item, rowIndex) => {
            item.forEach((label, columnIndex) => {
                if (serviceRow[columnIndex]?.label !== label) {
                    serviceRow[columnIndex] = rows[columnIndex][
                        rowIndex * valuesQuantity + offsetRows
                    ] = CellSource.createHeaderCell(
                        label,
                        valuesQuantity,
                        1,
                        new CellPath(
                            item.slice(0, columnIndex + 1),
                            CellPath.emptyRows,
                            -1,
                        ),
                    );

                    serviceRow.length = columnIndex + 1;
                } else serviceRow[columnIndex].colspan += valuesQuantity;
            });

            setup.values.forEach(({ label, column }, i) => {
                valuesLabelsRow[rowIndex * valuesQuantity + offsetRows + i] =
                    CellSource.createHeaderCell(
                        label,
                        1,
                        1,
                        new CellPath(item, CellPath.emptyRows, column),
                    );
            });
        });
    } else if (setup.showValuesLabels) {
        const labels: CellSource[] = setup.values.map(({ label, column }) =>
            CellSource.createHeaderCell(
                label,
                1,
                1,
                new CellPath(CellPath.emptyColumns, CellPath.emptyRows, column),
            ),
        );
        const row: CellSource[] = Array(offsetColumns);

        for (let i = 0, lim = pivotTableView.columns.length; i < lim; i++)
            row.push(...labels);

        rows.push(row);
    }

    if (offsetColumns > 0 && offsetRows > 0)
        rows[0][0] = CellSource.createHeaderCell(
            "",
            offsetRows,
            offsetColumns,
            CellPath.empty,
        );

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
                    row[columnIndex] = serviceRow[columnIndex] =
                        CellSource.createHeaderCell(
                            label,
                            1,
                            1,
                            new CellPath(
                                CellPath.emptyColumns,
                                rowItem.slice(0, columnIndex + 1),
                                -1,
                            ),
                        );

                    serviceRow.length = columnIndex + 1;
                } else serviceRow[columnIndex].rowspan += 1;
            });

            pivotTableView.values[rowIndex].forEach(
                ({ content, column, columnsPath }, i) =>
                    (row[i + valuesOffset] = CellSource.createContentCell(
                        content,
                        new CellPath(columnsPath, rowItem, column),
                    )),
            );
        });
    } else {
        const length = valuesQuantity * pivotTableView.columns.length;

        pivotTableView.values.forEach(valuesRow => {
            const row = Array(length).fill(CellSource.emptyContent);

            rows.push(row);

            valuesRow.forEach(
                ({ content, column, columnsPath }, i) =>
                    (row[i] = CellSource.createContentCell(
                        content,
                        new CellPath(columnsPath, CellPath.emptyRows, column),
                    )),
            );
        });
    }

    return CellSource.toCellTable(rows, pivotTableTree);
}

export class CellPath {
    static readonly emptyColumns = [];
    static readonly emptyRows = [];

    static readonly empty = new CellPath(
        CellPath.emptyColumns,
        CellPath.emptyRows,
        -1,
    );

    constructor(
        public readonly columns: string[],
        public readonly rows: string[],
        public readonly value: number,
    ) {}
}

type PartialWritable<T, WritableKeys extends keyof T> = {
    -readonly [Property in WritableKeys]: T[Property];
} &
    { readonly [Property in Exclude<keyof T, WritableKeys>]: T[Property] };

class CellSource implements PartialWritable<Cell, "colspan" | "rowspan"> {
    static readonly emptyContent = new CellSource(
        Cell.Type.Content,
        "",
        1,
        1,
        new CellPath([], [], -1),
    );

    static toCellTable(
        source: CellSource[][],
        pivotTableTree: PivotTableTree,
    ): Cell[][] {
        return source.map(row =>
            row.map(item => {
                const cell = item.toCell();

                pivotTableTree.cellMap.set(cell, item.path);

                return cell;
            }),
        );
    }

    static createHeaderCell(
        label: Cell["label"],
        colspan: Cell["colspan"],
        rowspan: Cell["rowspan"],
        path: CellPath,
    ): CellSource {
        return new CellSource(Cell.Type.Header, label, colspan, rowspan, path);
    }

    static createContentCell(label: string, path: CellPath): CellSource {
        return new CellSource(Cell.Type.Content, label, 1, 1, path);
    }

    constructor(
        public readonly type: Cell["type"],
        public readonly label: Cell["label"],
        public colspan: Cell["colspan"],
        public rowspan: Cell["rowspan"],
        public readonly path: CellPath,
    ) {}

    toCell(): Cell {
        return new Cell(this.type, this.label, this.colspan, this.rowspan);
    }
}
