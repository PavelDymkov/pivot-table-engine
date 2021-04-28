import { CellId } from "./pivot-table-view";
import { Sorter } from "./sorters";

export function sort(columnOrId: number | CellId, sorter: Sorter): SortItem {
    const column = typeof columnOrId === "number" ? columnOrId : -1;
    const id: CellId = column === -1 ? (columnOrId as CellId) : "";

    return new SortItem(sorter, column, id);
}

export class SortItem {
    constructor(
        public readonly sorter: Sorter,
        public readonly column: number,
        public readonly id: CellId,
    ) {}
}
