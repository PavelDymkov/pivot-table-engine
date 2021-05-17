enum Type {
    Header = "th",
    Content = "td",
}

export class Cell {
    static readonly Type = Type;

    constructor(
        public readonly type: Type,
        public readonly label: string,
        public readonly colspan: number,
        public readonly rowspan: number,
    ) {}
}
