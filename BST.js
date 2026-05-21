class BSTNode {
  constructor(value, id) {
    this.id = id;
    this.value = value;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
}

export class BST {
  constructor() {
    this.root = null;
    this.counter = 0;
  }

  // Insert a value and return generator for animation
  *insert(value) {
    const id = `node-${this.counter++}`;
    const newNode = new BSTNode(value, id);

    if (!this.root) {
      newNode.y = 5; // Start high up
      this.root = newNode;
      this.updatePositions();
      yield { type: 'ADDED', node: { ...newNode, color: '#f8d820' } };
      return;
    }

    let current = this.root;
    while (true) {
      // Highlight current node
      yield { type: 'HIGHLIGHT', id: current.id, color: '#00a800', isCompare: true };

      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }

    this.updatePositions();
    yield { type: 'ADDED', node: { ...newNode, color: '#f8d820' } };
    
    // Clear highlights
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }

  *delete(value) {
    let parent = null;
    let current = this.root;

    // Search
    while (current && current.value !== value) {
      yield { type: 'HIGHLIGHT', id: current.id, color: '#00f0ff', isCompare: true };
      parent = current;
      if (value < current.value) current = current.left;
      else current = current.right;
    }

    if (!current) {
      yield { type: 'CLEAR_HIGHLIGHTS' };
      return; // Not found
    }

    yield { type: 'HIGHLIGHT', id: current.id, color: '#e80000' };

    // Case 1: Leaf node
    if (!current.left && !current.right) {
      if (!parent) this.root = null;
      else if (parent.left === current) parent.left = null;
      else parent.right = null;
    }
    // Case 2: One child
    else if (!current.left || !current.right) {
      const child = current.left || current.right;
      if (!parent) this.root = child;
      else if (parent.left === current) parent.left = child;
      else parent.right = child;
    }
    // Case 3: Two children
    else {
      // Find successor (smallest in right subtree)
      let successorParent = current;
      let successor = current.right;
      yield { type: 'HIGHLIGHT', id: successor.id, color: '#00f0ff' };
      
      while (successor.left) {
        successorParent = successor;
        successor = successor.left;
        yield { type: 'HIGHLIGHT', id: successor.id, color: '#00f0ff' };
      }

      // Copy value
      current.value = successor.value;
      yield { type: 'SYNC' }; // To show value update before deleting successor
      
      // Delete successor
      if (successorParent.left === successor) successorParent.left = successor.right;
      else successorParent.right = successor.right;
    }

    this.updatePositions();
    yield { type: 'ADDED' };
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }

  *inorder() {
    function* traverse(node) {
      if (!node) return;
      yield* traverse(node.left);
      yield { type: 'HIGHLIGHT', id: node.id, color: '#00f0ff' }; // Cyan (visiting)
      yield { type: 'HIGHLIGHT', id: node.id, value: node.value, color: '#00a800' }; // Green (visited)
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

  // Calculate X, Y positions for the tree (simple recursive layout)
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

    // A wide range for the root to start dividing
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
        color: '#c84c0c' // Brick color
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
}
