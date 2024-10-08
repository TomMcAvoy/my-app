"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedAVLTree = void 0;
class ExtendedAVLTree {
    // eslint-disable-next-line no-unused-vars
    constructor(compareFn) {
        this.compareFn = compareFn;
        this.tree = new Map();
    }
    add(uuid, node) {
        this.tree.set(uuid, node);
    }
    contains(uuid) {
        return this.tree.has(uuid);
    }
    find(uuid) {
        for (const entry of this.tree.entries()) {
            if (entry[0] === uuid) {
                return entry;
            }
        }
        return undefined;
    }
    findByCreatedAtRange(start, end) {
        const result = [];
        for (const node of this.tree.values()) {
            if (node.getCreatedAt() >= start && node.getCreatedAt() <= end) {
                result.push(node);
            }
        }
        return result;
    }
    findByExactCreatedAt(time) {
        const result = [];
        for (const node of this.tree.values()) {
            if (node.getCreatedAt().getTime() === time.getTime()) {
                result.push(node);
            }
        }
        return result;
    }
    findByExactModifiedAt(time) {
        const result = [];
        for (const node of this.tree.values()) {
            if (node.getModifiedAt().getTime() === time.getTime()) {
                result.push(node);
            }
        }
        return result;
    }
    findByModifiedAtRange(start, end) {
        const result = [];
        for (const node of this.tree.values()) {
            if (node.getModifiedAt() >= start && node.getModifiedAt() <= end) {
                result.push(node);
            }
        }
        return result;
    }
    update(uuid, newNode) {
        const existingNode = this.tree.get(uuid);
        if (existingNode && existingNode.getVersion() === newNode.getVersion()) {
            newNode.incrementVersion();
            this.tree.set(uuid, newNode);
        }
        else {
            throw new Error('Version conflict detected');
        }
    }
}
exports.ExtendedAVLTree = ExtendedAVLTree;
//# sourceMappingURL=avlTree.js.map