export class Graph {
  constructor() {
    this.nodes = [];
    this.counter = 0;
  }

  *insert(value) {
    const id = `node-${this.counter++}`;
    const newNode = { id, value, x: 0, y: 0, z: 0, color: '#f8d820', adj: [] };
    
    // Connect to a random existing node if there are any to build a connected graph
    if (this.nodes.length > 0) {
      const targetIdx = Math.floor(Math.random() * this.nodes.length);
      const targetNode = this.nodes[targetIdx];
      newNode.adj.push(targetNode.id);
      targetNode.adj.push(newNode.id);
      
      // Add a second edge randomly to create cycles (if enough nodes)
      if (this.nodes.length > 2 && Math.random() > 0.4) {
         let secondTargetIdx;
         do {
             secondTargetIdx = Math.floor(Math.random() * this.nodes.length);
         } while (secondTargetIdx === targetIdx);
         const secondTarget = this.nodes[secondTargetIdx];
         newNode.adj.push(secondTarget.id);
         secondTarget.adj.push(newNode.id);
      }
    }

    this.nodes.push(newNode);
    this.updatePositions();
    yield { type: 'ADDED', node: { ...newNode } };
  }

  *delete(value) {
    const index = this.nodes.findIndex(n => n.value === value);
    if (index === -1) {
      yield { type: 'CLEAR_HIGHLIGHTS' };
      return;
    }
    
    const nodeToDelete = this.nodes[index];
    nodeToDelete.color = '#e80000'; // red
    yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };

    // Remove from other nodes' adjacency lists
    for (const otherNode of this.nodes) {
       otherNode.adj = otherNode.adj.filter(id => id !== nodeToDelete.id);
    }
    
    // Remove the node itself
    this.nodes.splice(index, 1);
    this.updatePositions();
    yield { type: 'ADDED' };
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }

  updatePositions() {
    // Circle layout for the graph
    const n = this.nodes.length;
    if (n === 0) return;
    
    // As nodes increase, radius grows
    const radius = Math.max(4, n * 1.2);
    
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * 2 * Math.PI;
      this.nodes[i].x = Math.cos(angle) * radius;
      this.nodes[i].y = Math.sin(angle) * radius;
      this.nodes[i].z = 0;
    }
  }

  getNodesAndEdges() {
    const edges = [];
    const addedEdges = new Set();
    
    const nodes = this.nodes.map(n => ({
      id: n.id,
      value: n.value,
      x: n.x, y: n.y, z: n.z,
      color: '#c84c0c'
    }));

    for (const node of this.nodes) {
      for (const adjId of node.adj) {
        const edgeId1 = `${node.id}-${adjId}`;
        const edgeId2 = `${adjId}-${node.id}`;
        
        // Prevent duplicate undirected edges
        if (!addedEdges.has(edgeId1) && !addedEdges.has(edgeId2)) {
          addedEdges.add(edgeId1);
          const targetNode = this.nodes.find(n => n.id === adjId);
          edges.push({
            id: edgeId1,
            source: [node.x, node.y, node.z],
            target: [targetNode.x, targetNode.y, targetNode.z],
            color: '#ffffff'
          });
        }
      }
    }
    
    return { nodes, edges };
  }

  *bfs() {
    if (this.nodes.length === 0) return;
    const visited = new Set();
    const queue = [this.nodes[0]];
    visited.add(this.nodes[0].id);

    while (queue.length > 0) {
      const current = queue.shift();
      yield { type: 'HIGHLIGHT', id: current.id, value: current.value, color: '#00f0ff' };
      yield { type: 'HIGHLIGHT', id: current.id, value: current.value, color: '#00a800' };

      for (const neighborId of current.adj) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          const neighbor = this.nodes.find(n => n.id === neighborId);
          queue.push(neighbor);
        }
      }
    }
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }

  *dfs() {
    if (this.nodes.length === 0) return;
    const visited = new Set();

    function* traverse(nodeId, graph) {
      visited.add(nodeId);
      const node = graph.nodes.find(n => n.id === nodeId);
      yield { type: 'HIGHLIGHT', id: node.id, value: node.value, color: '#00f0ff' };
      yield { type: 'HIGHLIGHT', id: node.id, value: node.value, color: '#00a800' };

      for (const neighborId of node.adj) {
        if (!visited.has(neighborId)) {
          yield* traverse(neighborId, graph);
        }
      }
    }

    yield* traverse(this.nodes[0].id, this);
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }
}
