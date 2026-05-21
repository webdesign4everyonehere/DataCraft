const RED = '#e80000';
const BLACK = '#222222';

class RBTNode {
  constructor(value, id) {
    this.id = id;
    this.value = value;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.color = RED;
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
}

export class RedBlackTree {
  constructor() {
    this.root = null;
    this.counter = 0;
  }

  // Helper for layout
  updatePositions() {
    const horizontalSpacing = 2.5;
    const verticalSpacing = -2;

    const traverse = (node, level, minX, maxX) => {
      if (!node) return;
      
      node.x = (minX + maxX) / 2;
      node.y = 5 + level * verticalSpacing;
      
      traverse(node.left, level + 1, minX, node.x);
      traverse(node.right, level + 1, node.x, maxX);
    };

    traverse(this.root, 0, -15, 15);
  }

  getNodesAndEdges() {
    const nodes = [];
    const edges = [];

    const traverse = (node) => {
      if (!node) return;
      
      nodes.push({
        id: node.id,
        value: node.value,
        x: node.x,
        y: node.y,
        z: node.z,
        color: node.color
      });

      if (node.left) {
        edges.push({
          id: `${node.id}-${node.left.id}`,
          source: [node.x, node.y, node.z],
          target: [node.left.x, node.left.y, node.left.z],
          color: '#ffffff'
        });
        traverse(node.left);
      }
      
      if (node.right) {
        edges.push({
          id: `${node.id}-${node.right.id}`,
          source: [node.x, node.y, node.z],
          target: [node.right.x, node.right.y, node.right.z],
          color: '#ffffff'
        });
        traverse(node.right);
      }
    };

    traverse(this.root);
    return { nodes, edges };
  }

  *leftRotate(x) {
    let y = x.right;
    x.right = y.left;
    if (y.left != null) {
      y.left.parent = x;
    }
    y.parent = x.parent;
    if (x.parent == null) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }
    y.left = x;
    x.parent = y;
    this.updatePositions();
    yield { type: 'SYNC' };
  }

  *rightRotate(x) {
    let y = x.left;
    x.left = y.right;
    if (y.right != null) {
      y.right.parent = x;
    }
    y.parent = x.parent;
    if (x.parent == null) {
      this.root = y;
    } else if (x === x.parent.right) {
      x.parent.right = y;
    } else {
      x.parent.left = y;
    }
    y.right = x;
    x.parent = y;
    this.updatePositions();
    yield { type: 'SYNC' };
  }

  *fixInsert(k) {
    while (k.parent != null && k.parent.color === RED) {
      if (k.parent === k.parent.parent.left) {
        let u = k.parent.parent.right; // uncle
        if (u != null && u.color === RED) {
          k.parent.color = BLACK;
          u.color = BLACK;
          k.parent.parent.color = RED;
          k = k.parent.parent;
          yield { type: 'SYNC' };
        } else {
          if (k === k.parent.right) {
            k = k.parent;
            yield* this.leftRotate(k);
          }
          k.parent.color = BLACK;
          k.parent.parent.color = RED;
          yield { type: 'SYNC' };
          yield* this.rightRotate(k.parent.parent);
        }
      } else {
        let u = k.parent.parent.left; // uncle
        if (u != null && u.color === RED) {
          k.parent.color = BLACK;
          u.color = BLACK;
          k.parent.parent.color = RED;
          k = k.parent.parent;
          yield { type: 'SYNC' };
        } else {
          if (k === k.parent.left) {
            k = k.parent;
            yield* this.rightRotate(k);
          }
          k.parent.color = BLACK;
          k.parent.parent.color = RED;
          yield { type: 'SYNC' };
          yield* this.leftRotate(k.parent.parent);
        }
      }
    }
    if (this.root.color !== BLACK) {
      this.root.color = BLACK;
      yield { type: 'SYNC' };
    }
  }

  *insert(value) {
    const id = `node-${this.counter++}`;
    let node = new RBTNode(value, id);

    let y = null;
    let x = this.root;

    while (x != null) {
      yield { type: 'HIGHLIGHT', id: x.id, color: '#00f0ff', isCompare: true };
      y = x;
      if (node.value < x.value) {
        x = x.left;
      } else {
        x = x.right;
      }
    }

    node.parent = y;
    if (y == null) {
      this.root = node;
    } else if (node.value < y.value) {
      y.left = node;
    } else {
      y.right = node;
    }

    this.updatePositions();
    yield { type: 'ADDED' };

    if (node.parent == null) {
      node.color = BLACK;
      yield { type: 'SYNC' };
      yield { type: 'CLEAR_HIGHLIGHTS' };
      return;
    }

    if (node.parent.parent == null) {
      yield { type: 'CLEAR_HIGHLIGHTS' };
      return;
    }

    yield* this.fixInsert(node);
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }

  *inorder() {
    function* traverse(node) {
      if (!node) return;
      yield* traverse(node.left);
      yield { type: 'HIGHLIGHT', id: node.id, color: '#00f0ff' };
      yield { type: 'HIGHLIGHT', id: node.id, value: node.value, color: '#00a800' };
      yield* traverse(node.right);
    }
    yield* traverse(this.root);
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }

  *preorder() {
    function* traverse(node) {
      if (!node) return;
      yield { type: 'HIGHLIGHT', id: node.id, color: '#00f0ff' };
      yield { type: 'HIGHLIGHT', id: node.id, value: node.value, color: '#00a800' };
      yield* traverse(node.left);
      yield* traverse(node.right);
    }
    yield* traverse(this.root);
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }

  *postorder() {
    function* traverse(node) {
      if (!node) return;
      yield* traverse(node.left);
      yield* traverse(node.right);
      yield { type: 'HIGHLIGHT', id: node.id, color: '#00f0ff' };
      yield { type: 'HIGHLIGHT', id: node.id, value: node.value, color: '#00a800' };
    }
    yield* traverse(this.root);
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }

  *bfs() {
    if (!this.root) return;
    const queue = [this.root];
    while (queue.length > 0) {
      const node = queue.shift();
      yield { type: 'HIGHLIGHT', id: node.id, color: '#00f0ff' };
      yield { type: 'HIGHLIGHT', id: node.id, value: node.value, color: '#00a800' };
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }
}
