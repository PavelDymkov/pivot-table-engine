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

            if (success) {
                if (node.children.length === 0) return node;

                const child = NodeTitleExtended.find(node.children, predicate);

                if (child) return child;
            }
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
        public readonly connectTo: any[] | null,
    ) {}
}
