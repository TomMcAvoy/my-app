import { ExtendedTreeNode } from './extendedTreeNode';
export declare class ExtendedAVLTree<T extends ExtendedTreeNode> {
    private compareFn;
    private tree;
    constructor(compareFn: (a: T, b: T) => number);
    add(uuid: string, node: T): void;
    contains(uuid: string): boolean;
    find(uuid: string): [string, T] | undefined;
    findByCreatedAtRange(start: Date, end: Date): T[];
    findByExactCreatedAt(time: Date): T[];
    findByExactModifiedAt(time: Date): T[];
    findByModifiedAtRange(start: Date, end: Date): T[];
    update(uuid: string, newNode: T): void;
}
//# sourceMappingURL=avlTree.d.ts.map