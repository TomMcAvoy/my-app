// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import { AVLTree } from 'avl-tree-typed';
import { ExtendedTreeNode } from './extendedTreeNode';

export class ExtendedAVLTree<T extends ExtendedTreeNode> {
  // eslint-disable-next-line no-unused-vars
  private compareFn: (a: T, b: T) => number;
  private tree: Map<string, T>;

  // eslint-disable-next-line no-unused-vars
  constructor(compareFn: (a: T, b: T) => number) {
    this.compareFn = compareFn;
    this.tree = new Map();
  }

  add(uuid: string, node: T): void {
    this.tree.set(uuid, node);
  }

  contains(uuid: string): boolean {
    return this.tree.has(uuid);
  }

  find(uuid: string): [string, T] | undefined {
    for (const entry of this.tree.entries()) {
      if (entry[0] === uuid) {
        return entry;
      }
    }
    return undefined;
  }

  findByCreatedAtRange(start: Date, end: Date): T[] {
    const result: T[] = [];
    for (const node of this.tree.values()) {
      if (node.getCreatedAt() >= start && node.getCreatedAt() <= end) {
        result.push(node);
      }
    }
    return result;
  }

  findByExactCreatedAt(time: Date): T[] {
    const result: T[] = [];
    for (const node of this.tree.values()) {
      if (node.getCreatedAt().getTime() === time.getTime()) {
        result.push(node);
      }
    }
    return result;
  }

  findByExactModifiedAt(time: Date): T[] {
    const result: T[] = [];
    for (const node of this.tree.values()) {
      if (node.getModifiedAt().getTime() === time.getTime()) {
        result.push(node);
      }
    }
    return result;
  }

  findByModifiedAtRange(start: Date, end: Date): T[] {
    const result: T[] = [];
    for (const node of this.tree.values()) {
      if (node.getModifiedAt() >= start && node.getModifiedAt() <= end) {
        result.push(node);
      }
    }
    return result;
  }

  update(uuid: string, newNode: T): void {
    const existingNode = this.tree.get(uuid);
    if (existingNode && existingNode.getVersion() === newNode.getVersion()) {
      newNode.incrementVersion();
      this.tree.set(uuid, newNode);
    } else {
      throw new Error('Version conflict detected');
    }
  }
}
