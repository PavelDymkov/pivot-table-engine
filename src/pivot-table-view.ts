import { not } from "logical-not";

import { PivotTableSetup } from "./pivot-table-setup";
import { Tree } from "./tree";

export class PivotTableView {
    constructor(
        readonly columns: Cell[][],
        readonly rows: Cell[][],
        readonly values: any[][],
        readonly offset: {
            columns: number;
            rows: number;
        },
    ) {}
}

export class Cell {
    constructor(
        readonly label: string,
        readonly colspan: number,
        readonly rowspan: number,
    ) {}
}

export function createAggregatedTable(
    tree: Tree,
    setup: PivotTableSetup,
): PivotTableView {
    const serviceTable = new ServiceTable(setup);

    tree.iterate(
        (key: string | symbol, i: number) => {
            const label =
                typeof key === "symbol" ? setup.getValueLabel(key) : key;

            serviceTable.addHeader(i, label);
        },
        setup.columns.length > 0
            ? (value: any) => {
                  serviceTable.addValue(value);
              }
            : (value: any): void => {
                  serviceTable.addValueNoColumns(value);
              },
    );

    return new PivotTableView(
        serviceTable.getColumns(),
        serviceTable.getRows(),
        serviceTable.getValues(),
        serviceTable.getOffset(),
    );
}

class ServiceTable {
    private rows: ServiceCell[][];
    private rowsLength: number;
    private rowsLastIndex: number;
    private columns: ServiceCell[][];
    private columnsLastIndex: number;

    private values: any[][] = [];

    constructor(private setup: PivotTableSetup) {
        this.rows = array(setup.rows.length);
        this.rowsLength = this.rows.length;
        this.rowsLastIndex = this.rowsLength - 1;
        this.columns = setup.showValuesLabels
            ? array(setup.columns.length + 1)
            : array(setup.columns.length);
        this.columnsLastIndex = this.columns.length - 1;
    }

    addHeader(i: number, label: string): void {
        if (i < this.rowsLength) {
            this.rows[i].push(new ServiceCell(label));

            if (i === this.rowsLastIndex)
                this.rows.forEach(this.increaseSpanToLast);
        } else {
            i -= this.rowsLength;

            if (i > this.columnsLastIndex) {
                if (this.setup.showValuesLabels)
                    this.columns[i].push(new ServiceCell(label));

                this.columns.forEach(this.increaseSpanToLast);
            } else {
                if (this.setup.columns.length === 0) {
                    const [row] = this.columns;
                    const exists = row.find(item => item.label === label);

                    if (not(exists)) {
                        const cell = new ServiceCell(label);

                        cell.span = 1;

                        row.push(cell);
                    }
                } else {
                    this.columns[i].push(new ServiceCell(label));

                    if (i === this.columnsLastIndex)
                        this.columns.forEach(this.increaseSpanToLast);
                }
            }
        }
    }

    addValue(value: any): void {
        const column = this.columns[this.columnsLastIndex].length - 1;
        const row = this.rows[this.rowsLastIndex].length - 1;

        if (not(this.values[row])) this.values[row] = [];

        this.values[row][column] = value;
    }

    addValueNoColumns(value: any): void {
        const row = this.rows[this.rowsLastIndex].length - 1;

        if (not(this.values[row])) this.values[row] = [];

        this.values[row].push(value);
    }

    getColumns(): Cell[][] {
        const cells: Cell[][] = [];

        this.columns.forEach((item, row) => {
            let column = 0;

            item.forEach(({ span, label }) => {
                if (not(cells[row])) cells[row] = [];

                const cell = new Cell(label, span, 1);

                cells[row][column] = cell;

                column += span;
            });
        });

        return cells;
    }

    getRows(): Cell[][] {
        const cells: Cell[][] = [];

        this.rows.forEach((item, column) => {
            let row = 0;

            item.forEach(({ span, label }) => {
                if (not(cells[row])) cells[row] = [];

                const cell = new Cell(label, 1, span);

                cells[row][column] = cell;

                row += span;
            });
        });

        return cells;
    }

    getValues(): any[][] {
        let length = 0;

        for (let i = 0, lim = this.values.length; i < lim; i++)
            length = Math.max(this.values[i].length, length);

        for (let i = 0, lim = this.values.length; i < lim; i++)
            this.values[i].length = length;

        return this.values;
    }

    getOffset(): PivotTableView["offset"] {
        return {
            columns: this.columns.length,
            rows: this.rows.length,
        };
    }

    private increaseSpanToLast(this: unknown, item: ServiceCell[]): void {
        const last = item[item.length - 1];

        last.span += 1;
    }
}

function array(length: number): ServiceCell[][] {
    return Array(length)
        .fill(null)
        .map(() => []);
}

class ServiceCell {
    span = 0;

    constructor(readonly label: string) {}
}

type CellSpanKey = keyof Pick<Cell, "colspan" | "rowspan">;
