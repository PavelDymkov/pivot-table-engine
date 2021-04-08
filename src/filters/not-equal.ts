import { Filter } from "./filter";

export class FilterNotEqual extends Filter {
    constructor(private readonly value: any) {
        super();
    }

    check(value: any): boolean {
        return value !== this.value;
    }
}
