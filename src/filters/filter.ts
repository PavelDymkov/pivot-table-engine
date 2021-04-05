export abstract class Filter {
    public abstract check(value: any): boolean;

    protected abstract init(value: any): void;
}
