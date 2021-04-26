import { PivotTableSetup } from "../pivot-table-setup";
import { IS_COLUMN, IS_ID } from "../pivot-table-view";
import { SortItem } from "../sort";

export class SortSetup {
    readonly columns: SortItem[];
    readonly rows: SortItem[];
    readonly values: SortItem[];

    constructor(sort: SortItem[], setup: PivotTableSetup) {
        this.columns = [];
        this.rows = [];
        this.values = [];

        sort.forEach(item => {
            const { column } = item;

            switch (true) {
                case Boolean(column & IS_ID):
                    if (column & IS_COLUMN) this.columns.push(item);
                    else this.rows.push(item);
                    break;
                case setup.columns.includes(column):
                    this.columns.push(item);
                    break;
                case setup.rows.includes(column):
                    this.rows.push(item);
                    break;
                case !!setup.values.find(({ index }) => index === column):
                    this.values.push(item);
                    break;
            }
        });
    }
}
