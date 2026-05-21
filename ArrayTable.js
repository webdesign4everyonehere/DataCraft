export class ArrayTable {
  constructor() {
    this.nodes = [];
    this.counter = 0;
  }

  *insert(value) {
    const id = `node-${this.counter++}`;
    const newNode = { id, value, x: 0, y: 0, z: 0, color: '#c84c0c' };
    this.nodes.push(newNode);
    this.updatePositions();
    yield { type: 'ADDED' };
  }

  *delete(value) {
    const index = this.nodes.findIndex(n => n.value === value);
    if (index === -1) {
       yield { type: 'CLEAR_HIGHLIGHTS' };
       return;
    }

    // Highlight node to delete
    this.nodes[index].color = '#e80000'; // red
    yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };

    // Shift elements
    for (let i = index; i < this.nodes.length - 1; i++) {
       this.nodes[i].color = '#00f0ff';
       this.nodes[i+1].color = '#00f0ff';
       yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };
       
       this.nodes[i].value = this.nodes[i+1].value;
       
       this.nodes[i].color = '#c84c0c';
       this.nodes[i+1].color = '#c84c0c';
       yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };
    }
    
    // Remove last element
    this.nodes.pop();
    this.updatePositions();
    yield { type: 'ADDED' };
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }

  updatePositions() {
    const spacing = 2;
    const totalWidth = (this.nodes.length - 1) * spacing;
    let startX = -totalWidth / 2;
    
    this.nodes.forEach((node, index) => {
      node.x = startX + (index * spacing);
      node.y = 0; // Centered
      node.z = 0;
    });
  }

  getNodesAndEdges() {
    // Deep clone array to avoid React mutation issues
    return { 
      nodes: this.nodes.map(n => ({...n})), 
      edges: [] 
    };
  }

  // Visual Bubble Sort
  *bubbleSort() {
    if (this.nodes.length <= 1) return;
    const n = this.nodes.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Highlight compare
        this.nodes[j].color = '#00f0ff'; // Cyan
        this.nodes[j+1].color = '#00f0ff';
        yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes, isCompare: true };
        
        if (this.nodes[j].value > this.nodes[j+1].value) {
          // Highlight swap
          this.nodes[j].color = '#e80000'; // Mario Red
          this.nodes[j+1].color = '#e80000';
          yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };

          // Swap
          const temp = this.nodes[j];
          this.nodes[j] = this.nodes[j+1];
          this.nodes[j+1] = temp;
          
          this.updatePositions();
          yield { type: 'SWAP' };
        }
        
        // Reset color
        this.nodes[j].color = '#c84c0c';
        this.nodes[j+1].color = '#c84c0c';
      }
      // Mark as sorted
      this.nodes[n - 1 - i].color = '#00a800'; // Pipe Green
      yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };
    }
    this.nodes[0].color = '#00a800';
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }

  // Visual Selection Sort
  *selectionSort() {
    if (this.nodes.length <= 1) return;
    const n = this.nodes.length;

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      this.nodes[minIdx].color = '#e80000'; // Mario Red for min
      yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };

      for (let j = i + 1; j < n; j++) {
        this.nodes[j].color = '#00f0ff'; // Cyan for compare
        yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes, isCompare: true };

        if (this.nodes[j].value < this.nodes[minIdx].value) {
          if (minIdx !== i) {
            this.nodes[minIdx].color = '#c84c0c'; // Reset old min
          }
          minIdx = j;
          this.nodes[minIdx].color = '#e80000'; // Highlight new min
          yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };
        } else {
          this.nodes[j].color = '#c84c0c'; // Reset compare
        }
      }

      if (minIdx !== i) {
        // Highlight swap
        this.nodes[i].color = '#e80000';
        yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };

        // Swap
        const temp = this.nodes[i];
        this.nodes[i] = this.nodes[minIdx];
        this.nodes[minIdx] = temp;
        this.updatePositions();
        yield { type: 'SWAP' };
      }
      
      // Mark as sorted
      this.nodes[i].color = '#00a800'; // Pipe Green
      if (minIdx !== i && minIdx < n) {
        this.nodes[minIdx].color = '#c84c0c';
      }
      yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };
    }
    this.nodes[n - 1].color = '#00a800';
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }

  // Visual Insertion Sort
  *insertionSort() {
    if (this.nodes.length <= 1) return;
    const n = this.nodes.length;

    this.nodes[0].color = '#00a800'; // First element trivially sorted
    yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };

    for (let i = 1; i < n; i++) {
      let j = i;
      this.nodes[j].color = '#00f0ff'; // Current element
      yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };

      while (j > 0 && this.nodes[j - 1].value > this.nodes[j].value) {
        this.nodes[j].color = '#e80000'; // Highlight swap
        this.nodes[j - 1].color = '#e80000';
        yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes, isCompare: true };

        // Swap
        const temp = this.nodes[j];
        this.nodes[j] = this.nodes[j - 1];
        this.nodes[j - 1] = temp;
        this.updatePositions();
        yield { type: 'SWAP' };

        this.nodes[j].color = '#00a800'; // Re-color sorted part
        j--;
        this.nodes[j].color = '#00f0ff';
        yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };
      }
      this.nodes[j].color = '#00a800'; // Mark as sorted
      yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };
    }
    yield { type: 'CLEAR_HIGHLIGHTS' };
  }

  // Visual Quick Sort
  *quickSort(low = 0, high = this.nodes.length - 1) {
    if (this.nodes.length <= 1) return;
    if (low < high) {
      const pi = yield* this.partition(low, high);
      yield* this.quickSort(low, pi - 1);
      yield* this.quickSort(pi + 1, high);
    }
    if (low === 0 && high === this.nodes.length - 1) {
      for (let i = 0; i < this.nodes.length; i++) {
        this.nodes[i].color = '#00a800';
      }
      yield { type: 'CLEAR_HIGHLIGHTS' };
    } else if (low === high && low >= 0 && low < this.nodes.length) {
      this.nodes[low].color = '#00a800';
      yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };
    }
  }

  *partition(low, high) {
    const pivot = this.nodes[high];
    this.nodes[high].color = '#e80000'; // Pivot
    yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };

    let i = low - 1;

    for (let j = low; j < high; j++) {
      this.nodes[j].color = '#00f0ff'; // Compare
      yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes, isCompare: true };

      if (this.nodes[j].value < pivot.value) {
        i++;
        if (i !== j) {
          this.nodes[i].color = '#00f0ff';
          yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };
          
          // Swap
          const temp = this.nodes[i];
          this.nodes[i] = this.nodes[j];
          this.nodes[j] = temp;
          this.updatePositions();
          yield { type: 'SWAP' };
          
          this.nodes[i].color = '#c84c0c'; // Reset
        } else {
          this.nodes[i].color = '#c84c0c'; // Reset
        }
      } else {
        this.nodes[j].color = '#c84c0c'; // Reset
      }
    }

    if (i + 1 !== high) {
      this.nodes[i + 1].color = '#e80000';
      yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };

      // Swap pivot
      const temp = this.nodes[i + 1];
      this.nodes[i + 1] = this.nodes[high];
      this.nodes[high] = temp;
      this.updatePositions();
      yield { type: 'SWAP' };
    }

    this.nodes[i + 1].color = '#00a800'; // Pivot in right place
    if (high !== i + 1) this.nodes[high].color = '#c84c0c'; // Reset old pivot pos if swapped
    
    yield { type: 'HIGHLIGHT', tempNodes: this.getNodesAndEdges().nodes };
    return i + 1;
  }
}
