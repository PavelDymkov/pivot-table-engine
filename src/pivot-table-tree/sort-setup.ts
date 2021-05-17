import { not } from "logical-not";

import { PivotTableSetup } from "../setup";
import { SortItem } from "../sort";
import { Sorter } from "../sorters";

export class SortSetup {
    readonly columns: Sorter[][];
    readonly rows: Sorter[][];

    readonly values: SortItem[];

    constructor(sort: SortItem[], setup: PivotTableSetup) {
        this.columns = [];
        this.rows = [];
        this.values = [];

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

        // sort.forEach(item => {
        //     const { column, id } = item;

        //     switch (true) {
        //         case Boolean(id):
        //             switch (decodeCellOwnerType(id)) {
        //                 case CellOwnerType.Column:
        //                     this.columns.push(item);
        //                     break;
        //                 case CellOwnerType.Row:
        //                     this.rows.push(item);
        //                     break;
        //             }
        //             break;
        //         case setup.columns.includes(column):
        //             this.columns.push(item);
        //             break;
        //         case setup.rows.includes(column):
        //             this.rows.push(item);
        //             break;
        //         case !!setup.values.find(({ index }) => index === column):
        //             this.values.push(item);
        //             break;
        //     }
        // });
    }
}
