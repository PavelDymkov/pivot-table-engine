export type Formatter = (source: any) => string;

export const defaultFormatter: Formatter = (source: any) => String(source);
