import { PivotTableSetup } from "../pivot-table-setup";
import { CellOwnerType, decodeCellOwnerType } from "../pivot-table-view";
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
            const { column, id } = item;

            switch (true) {
                case Boolean(id):
                    switch (decodeCellOwnerType(id)) {
                        case CellOwnerType.Column:
                            this.columns.push(item);
                            break;
                        case CellOwnerType.Row:
                            this.rows.push(item);
                            break;
                    }
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
