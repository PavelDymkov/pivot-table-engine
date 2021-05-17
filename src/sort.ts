import { Cell } from "./cell";
import { Sorter } from "./sorters";

export function sort(columnOrCell: number | Cell, sorter: Sorter): SortItem {
    const column = typeof columnOrCell === "number" ? columnOrCell : -1;
    const cell = column === -1 ? (columnOrCell as Cell) : null;

    return new SortItem(sorter, column, cell);
}

export class SortItem {
    constructor(
        public readonly sorter: Sorter,
        public readonly column: number,
        public readonly cell: Cell | null,
    ) {}
}
