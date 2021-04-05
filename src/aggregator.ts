import { AggregateFunctionFactory, group, sum } from "./aggregate-function";
import { PivotTableView, createAggregatedTable } from "./pivot-table-view";
import { PivotTableSetup, ValuesInternal } from "./pivot-table-setup";
import { Table } from "./table";
import { Tree } from "./tree";
import { SortItem, SortOrder } from "./sort";
import { Column } from "./schema";
import { FilterItem } from "./filter";

const Group = group().constructor;

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

        const valuesGroup: ValuesInternal[] = [];
        const valuesAggregate: ValuesInternal[] = [];

        values.forEach(item => {
            if (item.aggregateFunction instanceof Group) valuesGroup.push(item);
            else valuesAggregate.push(item);
        });

        this.rowIndexArray.forEach(row => {
            tree.toRootNode();

            rows.forEach(column => {
                const label = this.table.getLabel(column, row);

                tree.toChild(label);
            });

            columns.forEach(column => {
                const label = this.table.getLabel(column, row);

                tree.toChild(label);
            });

            valuesGroup.forEach(({ index: column }) => {
                const label = this.table.getLabel(column, row);

                tree.toChild(label);
            });

            values.forEach(({ key, index }) => {
                tree.aggregate(
                    key,
                    this.table.getValue(index, row),
                    this.getAggregateFunctionFactory(index),
                );
            });
        });

        return createAggregatedTable(tree, this.setup);
    }

    filter(filters: FilterItem[]): void {
        this.rowIndexArray = this.rowIndexArray.filter(rowIndex =>
            filters.every(filter => {
                const value = this.table.getValue(filter.column, rowIndex);

                return filter.item.check(value);
            }),
        );
    }

    sort(items: SortItem[]): void {
        const columnTypeMap: Record<number, Column> = {};

        items.forEach(({ column }) => {
            columnTypeMap[column] = this.table.getSchema(column);
        });

        this.rowIndexArray.sort((a: number, b: number) => {
            for (let i = 0, lim = items.length; i < lim; i++) {
                const { column, order } = items[i];

                const valueA = this.table.getValue(column, a);
                const valueB = this.table.getValue(column, b);

                const compared = columnTypeMap[column].compare(valueA, valueB);

                if (compared === 0) continue;

                return order === SortOrder.AZ ? compared : -compared;
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
