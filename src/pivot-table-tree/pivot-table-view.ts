import { PivotTableTree } from "./pivot-table-tree";
import { Tree } from "./tree";

export interface PivotTableView {
    readonly columns: string[][];
    readonly rows: string[][];
    readonly values: ValueView[][];

    readonly offset: {
        readonly columns: number;
        readonly rows: number;
    };
}

export interface ValueView {
    content: string;
    column: number;
    columnsPath: string[];
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

                valuesForGroup.forEach(
                    i =>
                        (valuesRow[i + i0] = {
                            content: groups[i],
                            column: setup.values[i].column,
                            columnsPath: column.labels,
                        }),
                );
                valuesForAggregate.forEach(
                    i =>
                        (valuesRow[i + i0] = {
                            content: stringify[i](
                                aggregators[i].getSummeryValue(),
                            ),
                            column: setup.values[i].column,
                            columnsPath: column.labels,
                        }),
                );
            });
        });
    });

    if (pivotTableTree.cellSorter) {
        const rowAccumulators: RowAccumulator[] = [];

        rowsAccumulatorsMap.forEach(rowAccumulator => {
            rowAccumulators.push(rowAccumulator);
        });

        const { path, sorter } = pivotTableTree.cellSorter;

        rowAccumulators.sort((a, b) => {
            let aValue = -Infinity;
            let bValue = -Infinity;

            a.values.some(item =>
                item.some(({ column, columnsPath, content }) => {
                    if (
                        column === path.value &&
                        coincide(columnsPath, path.columns)
                    ) {
                        aValue = parseFloat(content);

                        return true;
                    }
                }),
            );

            b.values.some(item =>
                item.some(({ column, columnsPath, content }) => {
                    if (
                        column === path.value &&
                        coincide(columnsPath, path.columns)
                    ) {
                        bValue = parseFloat(content);

                        return true;
                    }
                }),
            );

            return sorter.compare(aValue, bValue);
        });

        group(rowAccumulators).forEach(rowAccumulator => {
            rows.push(...rowAccumulator.labels);
            values.push(...rowAccumulator.values);
        });
    } else {
        rowsAccumulatorsMap.forEach(rowAccumulator => {
            rows.push(...rowAccumulator.labels);
            values.push(...rowAccumulator.values);
        });
    }

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

function coincide(a: string[], b: string[]): boolean {
    for (let i = 0, lim = Math.min(a.length, b.length); i < lim; i++) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}

function group(source: RowAccumulator[]): RowAccumulator[] {
    const output: RowAccumulator[] = [];

    source = source.slice();

    for (let item = source.shift(); item; item = source.shift()) {
        output.push(item);

        const labels = item.labelsSource.slice(0, -1);

        while (labels.length) {
            for (let j = 0; j < source.length; j++) {
                if (coincide(labels, source[j].labelsSource)) {
                    output.push(source[j]);

                    source.splice(j, 1);
                }
            }

            labels.pop();
        }
    }

    return output;
}

class RowAccumulator {
    readonly labels: string[][] = [this.labelsSource];
    readonly values: ValueView[][] = [[]];

    get lastValuesItem(): ValueView[] {
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
