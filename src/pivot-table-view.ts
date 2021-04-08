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
    ) {}
}
