import { not } from "logical-not";

import { AggregateFunction } from "../aggregate-functions";
import { Cell } from "../cell";
import { FilterItem } from "../filter";
import { PivotTableSetup, ValueSetupType } from "../setup";
import { SortItem } from "../sort";
import { Table } from "../table";
import { FiltersSetup } from "./filters-setup";
import { SortSetup } from "./sort-setup";
import { toCells } from "./to-cells";
import { Tree } from "./tree";

const UNDEFINED = void 0;

export class PivotTableTree {
    readonly rows: Tree<Row>;
    readonly columns: Tree<Column>;

    constructor(
        public readonly setup: PivotTableSetup,
        public readonly table: Table,
        filters: FilterItem[],
        sort: SortItem[],
    ) {
        const rowsTree = new Tree<Row>();
        const columnsTree = new Tree<Column>();

        const filtersSetup = new FiltersSetup(filters, setup);
        const values: {
            item: Value;
            columnPath: string[];
            rowPath: string[];
            path: string[];
        }[] = [];
        const sortSetup = new SortSetup(sort, setup);

        rowsTree.sort = sortSetup.rows;
        columnsTree.sort = sortSetup.columns;

        iterating: for (let row = 0, lim = table.rows; row < lim; row++) {
            const rowPath: string[] = [];

            for (let i = 0, lim = setup.rows.length; i < lim; i++) {
                const column = setup.rows[i];
                const label = getLabel(table, column, row);

                if (not(label)) continue iterating;

                const omit = filtersSetup.rows[column]?.some(({ filter }) =>
                    not(filter.check(label)),
                );

                if (omit) continue iterating;

                rowPath.push(label);
            }

            const columnPath: string[] = [];

            for (let i = 0, lim = setup.columns.length; i < lim; i++) {
                const column = setup.columns[i];
                const label = getLabel(table, column, row);

                if (not(label)) continue iterating;

                const omit = filtersSetup.columns[column]?.some(({ filter }) =>
                    not(filter.check(label)),
                );

                if (omit) continue iterating;

                columnPath.push(label);
            }

            const rowLeafItem = rowsTree.touchLeaf(
                rowPath,
                () => new Row(rowPath),
            );
            const columnLeafItem = columnsTree.touchLeaf(
                columnPath,
                () => new Column(columnPath),
            );

            const path: string[] = [];

            for (let i = 0, lim = setup.valuesForGroup.length; i < lim; i++) {
                if (not(i in setup.valuesForGroup)) continue;

                const column = setup.values[i].column;
                const label = getLabel(table, column, row);

                if (not(label)) continue iterating;

                const omit = filtersSetup.valuesGroup[
                    column
                ]?.some(({ filter }) => not(filter.check(label)));

                if (omit) continue iterating;

                path.push(label);
            }

            const valuesLeafItem = columnLeafItem.valuesTree.touchLeaf(
                path,
                () => new Values(),
            );

            rowLeafItem.values.add(valuesLeafItem);

            const value = valuesLeafItem.get(
                rowLeafItem,
                () =>
                    new Value(
                        path,
                        setup.valuesForAggregate.map(i =>
                            setup.values[i].aggregateFunction!(),
                        ),
                    ),
            );

            values.push({
                item: value,
                path,
                columnPath,
                rowPath,
            });

            setup.valuesForAggregate.forEach(i => {
                const { type, column } = setup.values[i];

                const aggregator = value.aggregators[i];

                switch (type) {
                    case ValueSetupType.ValueAggregate:
                        aggregator.next(table.getValue(column, row));
                        break;
                    case ValueSetupType.Aggregate:
                        aggregator.next(UNDEFINED);
                        break;
                }
            });
        }

        filtersSetup.valuesAggregates.forEach(({ i, filter }) => {
            values.forEach(({ item, columnPath, rowPath, path }) => {
                if (not(filter.check(item.aggregators[i].getSummeryValue()))) {
                    const { valuesTree } = columnsTree.getLeaf(columnPath);

                    if (rowsTree.trace(rowPath) && valuesTree.trace(path)) {
                        const rowsLeafItem = rowsTree.getLeaf(rowPath);
                        const valuesLeafItem = valuesTree.getLeaf(path);

                        rowsLeafItem.values.delete(valuesLeafItem);

                        if (rowsLeafItem.values.size === 0)
                            rowsTree.root.remove(rowPath);

                        valuesLeafItem.remove(rowsLeafItem);

                        if (valuesLeafItem.empty) valuesTree.root.remove(path);
                        if (valuesTree.root.empty)
                            columnsTree.root.remove(columnPath);
                    }
                }
            });
        });

        this.rows = rowsTree;
        this.columns = columnsTree;
    }

    toCellTable(): Cell[][] {
        return toCells(this);
    }
}

function getLabel(table: Table, column: number, row: number): string {
    const value = table.getValue(column, row);

    return table.getFormatter(column)(value);
}

class Row {
    readonly values = new Set<Values>();

    constructor(public readonly labels: string[]) {}
}

class Column {
    readonly valuesTree = new Tree<Values>();

    constructor(public readonly labels: string[]) {}
}

class Values {
    private map = new Map<Row, Value>();

    get empty(): boolean {
        return this.map.size === 0;
    }

    get(row: Row, initial: () => Value): Value {
        if (not(this.map.has(row))) this.map.set(row, initial());

        return this.map.get(row)!;
    }

    set(row: Row, value: Value): void {
        this.map.set(row, value);
    }

    remove(row: Row): void {
        this.map.delete(row);
    }

    forEach(callback: (row: Row, value: Value) => void): void {
        this.map.forEach((value, row) => callback(row, value));
    }
}

class Value {
    constructor(
        public readonly groups: string[],
        public readonly aggregators: AggregateFunction[],
    ) {}
}
