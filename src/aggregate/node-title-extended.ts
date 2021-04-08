export class NodeTitleExtended {
    static iterate(
        nodes: NodeTitleExtended[],
        callback: (node: NodeTitleExtended) => void,
    ): void {
        nodes.forEach(node => {
            callback(node);

            NodeTitleExtended.iterate(node.children, callback);
        });
    }

    static find(
        nodes: NodeTitleExtended[],
        predicate: (node: NodeTitleExtended) => boolean,
    ): NodeTitleExtended | null {
        for (let i = 0, lim = nodes.length; i < lim; i++) {
            const node = nodes[i];

            const success = predicate(node);

            if (success)
                return node.children.length > 0
                    ? NodeTitleExtended.find(node.children, predicate)
                    : node;
        }

        return null;
    }

    constructor(
        public readonly value: any,
        public readonly label: string,
        public readonly deep: number,
        public readonly offset: number,
        public readonly span: number,
        public readonly children: NodeTitleExtended[],
    ) {}
}
