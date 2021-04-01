import { not } from "logical-not";

import { PivotTableSetup } from "./pivot-table-setup";
import { Tree } from "./tree";

export class PivotTableView {
    constructor(
        readonly columns: Cell[][],
        readonly rows: Cell[][],
        readonly values: any[][],
    ) {}
}

export class Cell {
    colspan = 1;
    rowspan = 1;

    constructor(readonly label: string) {}
}

export function createAggregatedTable(
    tree: Tree,
    setup: PivotTableSetup,
): PivotTableView {
    const serviceTable = new ServiceTable(setup);

    tree.iterate(
        (label: string, i: number) => {
            serviceTable.addHeader(i, label);
        },
        (value: any) => {
            serviceTable.addValue(value);
        },
    );

    return new PivotTableView(
        serviceTable.getColumns(),
        serviceTable.getRows(),
        serviceTable.getValues(),
    );
}

class ServiceTable {
    private rows: ServiceCell[][];
    private rowsLength: number;
    private rowsLastIndex: number;
    private columns: ServiceCell[][];
    private columnsLastIndex: number;

    private values: any[][] = [];

    constructor(setup: PivotTableSetup) {
        this.rows = this.array(setup.rows.length);
        this.rowsLength = this.rows.length;
        this.rowsLastIndex = this.rowsLength - 1;
        this.columns =
            Array.isArray(setup.values) && setup.values.length > 1
                ? this.array(setup.columns.length + 1)
                : this.array(setup.columns.length);
        this.columnsLastIndex = this.columns.length - 1;
    }

    addHeader(i: number, label: string): void {
        if (i < this.rowsLength) {
            this.rows[i].push(new ServiceCell(label));

            if (i === this.rowsLastIndex)
                this.rows.forEach(this.increaseSpanToLast);
        } else {
            i -= this.rowsLength;

            this.columns[i].push(new ServiceCell(label));

            if (i === this.columnsLastIndex)
                this.columns.forEach(this.increaseSpanToLast);
        }
    }

    addValue(value: any): void {
        const column = this.columns[this.columnsLastIndex].length - 1;
        const row = this.rows[this.rowsLastIndex].length - 1;

        if (not(this.values[row])) this.values[row] = [];

        this.values[row][column] = value;
    }

    getColumns(): Cell[][] {
        return this.toCell(this.columns, "rowspan");
    }

    getRows(): Cell[][] {
        return this.toCell(this.rows, "colspan");
    }

    getValues(): any[][] {
        let length = 0;

        for (let i = 0, lim = this.values.length; i < lim; i++)
            length = Math.max(this.values[i].length, length);

        for (let i = 0, lim = this.values.length; i < lim; i++)
            this.values[i].length = length;

        return this.values;
    }

    private array(length: number): ServiceCell[][] {
        return Array(length)
            .fill(null)
            .map(() => []);
    }

    private increaseSpanToLast(this: unknown, item: ServiceCell[]): void {
        const last = item[item.length - 1];

        last.span += 1;
    }

    private toCell(source: ServiceCell[][], key: CellSpanKey): Cell[][] {
        const cells: Cell[][] = [];

        source.forEach((item, column) => {
            let row = 0;

            item.forEach(({ span, label }) => {
                if (not(cells[row])) cells[row] = [];

                const cell = new Cell(label);

                cell[key] = span;
                cells[row][column] = cell;

                row += span;
            });
        });
        return cells;
    }
}

class ServiceCell {
    span = 0;

    constructor(readonly label: string) {}
}

type CellSpanKey = keyof Pick<Cell, "colspan" | "rowspan">;
