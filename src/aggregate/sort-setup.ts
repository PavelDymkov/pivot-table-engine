import { PivotTableSetup } from "../pivot-table-setup";
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
