import { AggregateFunctionFactory, sum } from "./aggregate-function";
import { PivotTableView, createAggregatedTable } from "./pivot-table-view";
import { PivotTableSetup, Values } from "./pivot-table-setup";
import { Table } from "./table";
import { Tree } from "./tree";
import { Filter } from "./filters";
import { Sort, SortDirection } from "./data";
import { Column } from "./schema";

export class Aggregator {
    private rowIndexArray!: Int32Array;

    constructor(
        private readonly table: Table,
        private readonly setup: PivotTableSetup,
        private readonly aggregateFunctions: Record<
            number,
            AggregateFunctionFactory
        >,
    ) {}

    init(): void {
        const rows = new Int32Array(this.table.rows);

        for (let i = 0, lim = rows.length; i < lim; i++) rows[i] = i;

        this.rowIndexArray = rows;
    }

    aggregate(): PivotTableView {
        const tree = new Tree();

        const { columns, rows, values } = this.setup;

        this.rowIndexArray.forEach(row => {
            tree.toRootNode();

            rows.forEach(column => {
                const label = this.table.getLabel(column, row);

                tree.toChild(label);
            });

            const columnsLastIndex = columns.length - 1;
            const isManyValues = Array.isArray(values) && values.length > 1;

            columns.forEach((column, i) => {
                const label = this.table.getLabel(column, row);

                if (i === columnsLastIndex) {
                    if (isManyValues) {
                        (values as Values[]).forEach(item => {
                            tree.finalize(
                                [label, item.label],
                                this.table.getValue(item.index, row),
                                this.getAggregateFunctionFactory(item.index),
                            );
                        });
                    } else {
                        tree.finalize(
                            [label],
                            this.table.getValue(column, row),
                            this.getAggregateFunctionFactory(column),
                        );
                    }
                } else {
                    tree.toChild(label);
                }
            });

            if (columns.length === 0 && Array.isArray(values)) {
                values.forEach(({ label, index }) => {
                    tree.finalize(
                        [label],
                        this.table.getValue(index, row),
                        this.getAggregateFunctionFactory(index),
                    );
                });
            }
        });

        return createAggregatedTable(tree, this.setup);
    }

    filter(filters: Filter[]): void {
        this.rowIndexArray = this.rowIndexArray.filter(rowIndex => {
            return filters.every(filter => {
                const value = this.table.getValue(filter.column, rowIndex);

                return filter.check(value);
            });
        });
    }

    sort(items: Sort[]): void {
        const columnTypeMap: Record<number, Column> = {};

        items.forEach(({ column }) => {
            columnTypeMap[column] = this.table.getSchema(column);
        });

        this.rowIndexArray.sort((a: number, b: number) => {
            for (let i = 0, lim = items.length; i < lim; i++) {
                const { column, direction } = items[i];

                const valueA = this.table.getValue(column, a);
                const valueB = this.table.getValue(column, b);

                const compared = columnTypeMap[column].compare(valueA, valueB);

                if (compared === 0) continue;

                return direction === SortDirection.AZ ? compared : -compared;
            }

            return 0;
        });
    }

    private getAggregateFunctionFactory(
        column: number,
    ): AggregateFunctionFactory {
        return this.aggregateFunctions[column] || sum;
    }
}
