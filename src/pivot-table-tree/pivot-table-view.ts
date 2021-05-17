import { PivotTableTree } from "./pivot-table-tree";
import { Tree } from "./tree";

export interface PivotTableView {
    readonly columns: string[][];
    readonly rows: string[][];
    readonly values: string[][];

    readonly offset: {
        readonly columns: number;
        readonly rows: number;
    };
}

export function createPivotTableView(
    pivotTableTree: PivotTableTree,
): PivotTableView {
    const { setup } = pivotTableTree;
    const { valuesForGroup, valuesForAggregate } = setup;

    const columns: PivotTableView["columns"] = [];
    const rows: PivotTableView["rows"] = [];
    const values: PivotTableView["values"] = [];

    type GetRowType<T> = T extends Tree<infer U> ? U : never;

    const rowsAccumulatorsMap = new Map<
        GetRowType<PivotTableTree["rows"]>,
        RowAccumulator
    >();

    const valuesQuantity = setup.values.length;

    pivotTableTree.rows.iterate(row =>
        rowsAccumulatorsMap.set(row, new RowAccumulator(row.labels)),
    );

    const stringify = valuesForAggregate.map(i => {
        const { column } = setup.values[i];

        if (column === -1) return (value: any) => String(value);

        return pivotTableTree.table.getFormatter(column);
    });

    pivotTableTree.columns.iterate(column => {
        const i0 = (columns.push(column.labels) - 1) * valuesQuantity;

        column.valuesTree.iterate(item => {
            item.forEach((row, { groups, aggregators }) => {
                const rowAccumulator = rowsAccumulatorsMap.get(row)!;

                let valuesRow = rowAccumulator.lastValuesItem;

                if (i0 in valuesRow) {
                    valuesRow = [];

                    rowAccumulator.values.push(valuesRow);
                    rowAccumulator.addLabels();
                }

                valuesForGroup.forEach(i => (valuesRow[i + i0] = groups[i]));
                valuesForAggregate.forEach(
                    i =>
                        (valuesRow[i + i0] = stringify[i](
                            aggregators[i].getSummeryValue(),
                        )),
                );
            });
        });
    });

    rowsAccumulatorsMap.forEach(rowAccumulator => {
        rows.push(...rowAccumulator.labels);
        values.push(...rowAccumulator.values);
    });

    return {
        columns,
        rows,
        values,

        offset: {
            columns: setup.showValuesLabels
                ? setup.columns.length + 1
                : setup.columns.length,
            rows: setup.rows.length,
        },
    };
}

class RowAccumulator {
    readonly labels: string[][] = [this.labelsSource];
    readonly values: string[][] = [[]];

    get lastValuesItem(): string[] {
        return this.values[this.values.length - 1];
    }

    get rows(): PivotTableView["rows"] {
        return (this.labels as any).flat(1);
    }

    constructor(public readonly labelsSource: string[]) {}

    addLabels(): void {
        this.labels.push(this.labelsSource);
    }
}
