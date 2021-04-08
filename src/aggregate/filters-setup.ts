import { PivotTableSetup } from "../pivot-table-setup";
import { FilterItem } from "../filter";

export class FiltersSetup {
    readonly columns: FilterItem[];
    readonly rows: FilterItem[];
    readonly values: FilterItem[];

    constructor(filters: FilterItem[], setup: PivotTableSetup) {
        this.columns = [];
        this.rows = [];
        this.values = [];

        filters.forEach(item => {
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
