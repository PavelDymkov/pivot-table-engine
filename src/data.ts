export enum FilterType {
    Equal = 1,
    // NotEqual,
    // GreaterThen,
    // LessThen,
    // GreaterThenOrEqual,
    // LessThenOrEqual,
    // Period,
    // DateList,
    // InList,
    // NotInList,
    // StartsOnIndex,
    // StartsOn,
    // EndsOnIndex,
    // EndsOn,
    // ContainsIndex,
    // Contains,
    // NotContainIndex,
    // NotContain,
}

export enum SortDirection {
    AZ = 1,
    ZA,
}

export interface Filter {
    column: number;
    type: FilterType;
    value: any | any[];
}

export interface Sort {
    column: number;
    direction: SortDirection;
}
