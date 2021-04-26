export class PivotTableView {
    constructor(
        readonly columns: Cell[][],
        readonly rows: Cell[][],
        readonly values: any[][],
        readonly offset: {
            readonly colspan: number;
            readonly rowspan: number;
        },
    ) {}
}

export class Cell {
    constructor(
        readonly label: string,
        readonly colspan: number,
        readonly rowspan: number,
        readonly id: number,
    ) {}
}

export const IS_ID = 1 << 31;
export const IS_COLUMN = 1 << 30;
export const IS_ROW = 0 << 30;

export function id(offset: number, deep: number, isColumn: boolean): number {
    return deep | (offset << 8) | (isColumn ? IS_COLUMN : IS_ROW) | IS_ID;
}

const offsetMask = Math.pow(2, 22) - 1;
const deepMask = Math.pow(2, 8) - 1;

export function parseId(
    source: number,
): { offset: number; deep: number; isColumn: boolean } {
    return {
        offset: (source >>> 8) & offsetMask,
        deep: source & deepMask,
        isColumn: Boolean(source & IS_COLUMN),
    };
}
