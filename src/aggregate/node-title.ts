import { not } from "logical-not";
import { SortItem } from "../sort";
import { NodeTitleExtended } from "./node-title-extended";

export enum NodeTitleTouchType {
    Aggregate = 1,
    Addition,
}

export class NodeTitle {
    static get Root(): NodeTitle {
        return new NodeTitle(0, null, "");
    }

    static toExtended(nodes: NodeTitle[]): NodeTitleExtended[] {
        return toExtended(nodes, 0, 0);
    }

    static sort(nodes: NodeTitle[], sortItems: SortItem[]): void {
        if (nodes.length === 0) return;

        const column = nodes[0].column;

        sortItems.forEach(item => {
            if (item.column === column)
                nodes.sort((a: NodeTitle, b: NodeTitle) =>
                    item.sorter.compare(a.value, b.value),
                );
        });

        nodes.forEach(node => NodeTitle.sort(node.children, sortItems));
    }

    readonly children: NodeTitle[] = [];
    public readonly connectTo: any[] = [];

    constructor(
        public readonly column: number,
        public readonly value: any,
        public readonly label: string,
    ) {}

    touch(items: NodeTitleTouchItem[], type: NodeTitleTouchType): void {
        switch (type) {
            case NodeTitleTouchType.Aggregate:
                touchAggregate(this, items);
                break;
            case NodeTitleTouchType.Addition:
                touchAddition(this, items);
                break;
        }
    }
}

export interface NodeTitleTouchItem {
    column: number;
    value: any;
    label?: string;
    connectTo?: any[];
}

function touchAggregate(node: NodeTitle, items: NodeTitleTouchItem[]): void {
    if (items.length > 0) {
        const item = items.shift()!;

        let child = node.children.find(({ value }) => value === item.value);

        if (not(child)) {
            child = create(item);

            node.children.push(child);
        }

        if (item.connectTo) child!.connectTo.push(item.connectTo);

        touchAggregate(child!, items);
    }
}

function touchAddition(node: NodeTitle, items: NodeTitleTouchItem[]): void {
    if (items.length > 0) {
        const item = items.shift()!;

        let child = node.children[node.children.length - 1];

        if (not(child) || child.value !== item.value) {
            child = create(item);

            node.children.push(child);
        }

        if (item.connectTo) child!.connectTo.push(item.connectTo);

        touchAddition(child!, items);
    }
}

function create(source: NodeTitleTouchItem): NodeTitle {
    return new NodeTitle(source.column, source.value, source.label || "");
}

function toExtended(
    nodes: NodeTitle[],
    deep: number,
    offset: number,
): NodeTitleExtended[] {
    return nodes.map(node => {
        const children = toExtended(node.children, deep + 1, offset);
        const span =
            children.reduce(
                (accumulate, child) => accumulate + child.span,
                0,
            ) || 1;

        const nodeExtended = new NodeTitleExtended(
            node.value,
            node.label,
            deep,
            offset,
            span,
            children,
            node.connectTo,
        );

        offset += span;

        return nodeExtended;
    });
}
