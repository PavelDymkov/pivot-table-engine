import { not } from "logical-not";

import { SortItem } from "../sort";
import { Sorter } from "../sorters";
import { PivotTableTree } from "./pivot-table-tree";
import { CellPath } from "./to-cells";

export class SortSetup {
    readonly columns: Sorter[][];
    readonly rows: Sorter[][];

    readonly values: SortItem[];

    readonly cellSorter: CellSorter[];

    constructor(sort: SortItem[], pivotTableTree: PivotTableTree) {
        const { setup, cellMap } = pivotTableTree;

        this.columns = [];
        this.rows = [];
        this.values = [];
        this.cellSorter = [];

        setup.columns.forEach((column, i) => {
            sort.forEach(item => {
                if (item.column === column) {
                    if (not(this.columns[i])) this.columns[i] = [];

                    this.columns[i].push(item.sorter);
                }
            });
        });

        setup.rows.forEach((column, i) => {
            sort.forEach(item => {
                if (item.column === column) {
                    if (not(this.rows[i])) this.rows[i] = [];

                    this.rows[i].push(item.sorter);
                }
            });
        });

        setup.values.forEach(valueSetup => {
            sort.forEach(item => {
                if (item.column === valueSetup.column) this.values.push(item);
            });
        });

        sort.forEach(({ cell, sorter }) => {
            if (cell) {
                const path = cellMap.get(cell)!;

                this.cellSorter.push({
                    path,
                    sorter,
                });
            }
        });
    }
}

export interface CellSorter {
    path: CellPath;
    sorter: Sorter;
}
