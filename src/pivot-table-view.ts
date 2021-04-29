export class PivotTableView {
    constructor(
        readonly columns: (Cell | null)[][],
        readonly rows: (Cell | null)[][],
        readonly values: number[][],
        readonly offset: {
            readonly colspan: number;
            readonly rowspan: number;
        },
    ) {}
}

export class Cell {
    readonly id: string;

    constructor(
        readonly label: string,
        readonly colspan: number,
        readonly rowspan: number,

        ownerType: CellOwnerType,
        offset: number,
        deep: number,
    ) {
        this.id = `#${ownerType}%${offset}%${deep}`;
    }
}

export type CellId = string;

export enum CellOwnerType {
    Column = "1",
    Row = "2",
}

export function decodeCellOwnerType(source: CellId): CellOwnerType {
    return source.slice(1, 2) as CellOwnerType;
}

export function decodeCellId(source: CellId): [string, string] {
    return source.split(/#|%/).slice(2) as [string, string];
}

export class CellSource {
    colspan = 1;
    rowspan = 1;

    constructor(
        public readonly label: string,
        public readonly ownerType: CellOwnerType,
        public readonly offset: number,
        public readonly deep: number,
    ) {}
}
