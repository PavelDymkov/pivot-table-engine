import { Filter } from "./filter";

export class FilterLessThen extends Filter {
    constructor(private readonly value: any) {
        super();
    }

    check(value: any): boolean {
        return value < this.value;
    }
}
