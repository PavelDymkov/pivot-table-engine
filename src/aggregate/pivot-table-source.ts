import { not } from "logical-not";

import { Filter } from "../filters";
import { PivotTableSetup } from "../pivot-table-setup";
import {
    Cell,
    CellOwnerType,
    CellSource,
    PivotTableView,
} from "../pivot-table-view";
import { Table } from "../table";
import { FiltersSetup } from "./filters-setup";
import { NodeValue } from "./node-value";
import { SortSetup } from "./sort-setup";
import { Key, Tree } from "./tree";

export class PivotTableSource {
    static create(
        table: Table,
        setup: PivotTableSetup,
        filtersSetup: FiltersSetup,
    ): PivotTableSource {
        return new PivotTableSource(table, setup, filtersSetup);
    }

    readonly columns: Column[];
    readonly rows: Row[];
    readonly values: NodeValue[];

    readonly tree: Tree;

    sort(sortSetup: SortSetup): void {}

    createPivotTable(): PivotTableView {
        const columns: Cell[][] = [];
        const rows: (CellSource | null)[][] = [];

        this.rows.forEach((row, offset) => {
            if (not(rows[offset])) rows[offset] = [];

            row.path.forEach((label, deep) => {
                for (let i = offset - 1; i >= 0; i--) {
                    const cell = rows[i][deep];

                    if (cell === null) continue;

                    if (cell.label === label) {
                        cell.rowspan += 1;

                        rows[offset][deep] = null;

                        return;
                    } else break;
                }

                rows[offset][deep] = new CellSource(
                    label,
                    CellOwnerType.Row,
                    offset,
                    deep,
                );
            });
        });

        return new PivotTableView(
            columns,
            rows.map(row =>
                row.map(
                    source =>
                        source &&
                        new Cell(
                            source.label,
                            source.colspan,
                            source.rowspan,
                            source.ownerType,
                            source.offset,
                            source.deep,
                        ),
                ),
            ),
            [],
            {
                colspan: 0,
                rowspan: 0,
            },
        );
    }

    private constructor(
        private readonly table: Table,
        private readonly setup: PivotTableSetup,
        filtersSetup: FiltersSetup,
    ) {
        const tree = new Tree();

        interface ValueFilter {
            key: symbol;
            path: string[];
            filter: Filter;
        }

        const valueFilters: ValueFilter[] = [];

        iterating: for (let row = 0, lim = table.rows; row < lim; row++) {
            const path: string[] = [];

            for (let i = 0, lim = setup.rows.length; i < lim; i++) {
                const column = setup.rows[i];
                const label = getLabel(table, column, row);

                if (not(label)) continue iterating;

                const omit = filtersSetup.rows[column]?.some(({ filter }) =>
                    not(filter.check(label)),
                );

                if (omit) continue iterating;

                path.push(label);
            }

            for (let i = 0, lim = setup.columns.length; i < lim; i++) {
                const column = setup.columns[i];
                const label = getLabel(table, column, row);

                if (not(label)) continue iterating;

                const omit = filtersSetup.columns[column]?.some(({ filter }) =>
                    not(filter.check(label)),
                );

                if (omit) continue iterating;

                path.push(label);
            }

            setup.values.forEach(({ key, index, aggregateFunction }) => {
                tree.addValue(
                    path,
                    key,
                    table.getValue(index, row),
                    aggregateFunction,
                );

                filtersSetup.values.forEach(({ column, filter }) => {
                    if (index === column)
                        valueFilters.push({
                            key,
                            path,
                            filter,
                        });
                });
            });
        }

        valueFilters.forEach(({ key, path, filter }) => {
            const value = tree.getValue(path, key);

            if (not(filter.check(value))) tree.remove(path);
        });

        const values: NodeValue[] = [];
        const path = [] as any[];

        tree.iterate(
            (key: Key, i: number) => {
                path[i] = key;
            },
            (value: any) => {
                const node = new NodeValue(path.slice(), value);

                values.push(node);
            },
        );

        const rowsStart = 0;
        const rowsEnd = setup.rows.length;
        const columnsStart = rowsEnd;
        const columnsEnd =
            columnsStart +
            setup.columns.length +
            (setup.values.length > 1 ? 1 : 0);

        const columns: Column[] = [];
        const rows: Row[] = [];

        const hasColumns = columnsStart !== columnsEnd;
        const hasRows = rowsEnd > 0;

        const columnsMap = Object.create(null) as any;
        const rowsMap = Object.create(null) as any;

        values.forEach(({ path }) => {
            let column: Column;

            if (hasColumns) {
                const value = path.slice(columnsStart, columnsEnd);

                let node = columnsMap;

                for (
                    let i = 0, lim = value.length, last = lim - 1;
                    i < lim;
                    i++
                ) {
                    const key = value[i];

                    if (i === last) {
                        if (not(node[key])) {
                            node[key] = new Column(value);

                            columns.push(node[key]);
                        }

                        column = node[key];
                    } else {
                        if (not(node[key])) node[key] = {};

                        node = node[key];
                    }
                }
            }

            if (hasRows) {
                const value = path.slice(rowsStart, rowsEnd);

                let node = rowsMap;

                for (
                    let i = 0, lim = value.length, last = lim - 1;
                    i < lim;
                    i++
                ) {
                    const label = value[i];

                    if (i === last) {
                        if (not(node[label])) {
                            node[label] = new Row(value);

                            rows.push(node[label]);
                        }

                        if (hasColumns)
                            node[label].connectedTo.push(column!.id);
                    } else {
                        if (not(node[label])) node[label] = {};

                        node = node[label];
                    }
                }
            }
        });

        this.columns = columns;
        this.rows = rows;
        this.values = values;

        this.tree = tree;
    }
}

function getLabel(table: Table, column: number, row: number): any {
    return table.getSchema(column).toString(table.getValue(column, row));
}

class Column {
    readonly id = Symbol();

    constructor(public readonly path: Key[]) {}
}

class Row {
    readonly connectedTo: symbol[] = [];

    constructor(public readonly path: string[]) {}
}
