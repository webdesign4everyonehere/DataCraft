import { create } from 'zustand';
import { BST } from '../structures/BST';
import { RedBlackTree } from '../structures/RedBlackTree';
import { ArrayTable } from '../structures/ArrayTable';
import { Graph } from '../structures/Graph';
import { playBlip } from '../utils/audio';

export const useStore = create((set, get) => ({
  structureType: 'BST',
  structureInstance: new BST(),
  nodes: [],
  edges: [],
  isMusicOn: false,
  speed: 1,
  isAnimating: false,
  traversalResult: [],
  currentTraversalType: '',
  stats: { operations: 0, comparisons: 0, swaps: 0 },
  theme: 'mario',
  cameraMode: 'orbit', // 'orbit' | 'fps'

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  setCameraMode: (mode) => set({ cameraMode: mode }),
  
  setStructureType: (type) => {
    let newInstance;
    if (type === 'BST') newInstance = new BST();
    else if (type === 'RBT') newInstance = new RedBlackTree();
    else if (type === 'TABLE') newInstance = new ArrayTable();
    else if (type === 'GRAPH') newInstance = new Graph();
    else newInstance = new BST(); 
    
    set({ 
      structureType: type, 
      structureInstance: newInstance, 
      nodes: [], 
      edges: [], 
      traversalResult: [],
      currentTraversalType: '',
      stats: { operations: 0, comparisons: 0, swaps: 0 }
    });
  },
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setIsMusicOn: (isMusicOn) => set({ isMusicOn }),
  setSpeed: (speed) => set({ speed }),
  
  // Helpers
  clearAll: () => {
    const { structureType } = get();
    get().setStructureType(structureType); // Resets instance
  },

  // Actions
  insertValue: async (value) => {
    const { structureInstance, speed } = get();
    if (get().isAnimating) return;
    set({ isAnimating: true, stats: { operations: 0, comparisons: 0, swaps: 0 } });

    const generator = structureInstance.insert(value);
    
    while (true) {
      const { value: step, done } = generator.next();
      if (done) break;

      // Update state based on step
      if (step.type === 'HIGHLIGHT') {
        playBlip(600, 'square', 0.05); // Traversal sound
        set(state => ({ stats: { ...state.stats, operations: state.stats.operations + 1, comparisons: step.isCompare ? state.stats.comparisons + 1 : state.stats.comparisons } }));
        
        if (step.tempNodes) {
          set({ nodes: step.tempNodes });
        } else {
          const { nodes } = structureInstance.getNodesAndEdges();
          set({
            nodes: nodes.map(n => n.id === step.id ? { ...n, color: step.color } : n)
          });
        }
      } else if (['ADDED', 'SYNC', 'CLEAR_HIGHLIGHTS'].includes(step.type)) {
        if (step.type === 'ADDED') playBlip(800, 'sine', 0.15); // Added sound
        else if (step.type === 'SYNC') playBlip(400, 'triangle', 0.05); // Rotation/Recolor sound
        
        set(state => ({ stats: { ...state.stats, operations: state.stats.operations + 1 } }));

        const { nodes, edges } = structureInstance.getNodesAndEdges();
        set({ nodes, edges });
      }

      // Wait for next step
      await new Promise(resolve => setTimeout(resolve, 800 / speed));
    }
    
    set({ isAnimating: false });
  },

  deleteValue: async (value) => {
    const { structureInstance, speed } = get();
    if (get().isAnimating) return;
    if (!structureInstance.delete) return; // Safeguard for unimplemented deletes like RBT
    
    set({ isAnimating: true, stats: { operations: 0, comparisons: 0, swaps: 0 } });

    const generator = structureInstance.delete(value);
    
    while (true) {
      const { value: step, done } = generator.next();
      if (done) break;

      if (step.type === 'HIGHLIGHT') {
        playBlip(600, 'square', 0.05); // Traversal sound
        set(state => ({ stats: { ...state.stats, operations: state.stats.operations + 1, comparisons: step.isCompare ? state.stats.comparisons + 1 : state.stats.comparisons } }));

        if (step.tempNodes) {
          set({ nodes: step.tempNodes });
        } else {
          const { nodes } = structureInstance.getNodesAndEdges();
          set({
            nodes: nodes.map(n => n.id === step.id ? { ...n, color: step.color } : n)
          });
        }
      } else if (['ADDED', 'SYNC', 'CLEAR_HIGHLIGHTS'].includes(step.type)) {
        if (step.type === 'ADDED') playBlip(800, 'sine', 0.15); // Added/Deleted sound
        else if (step.type === 'SYNC') playBlip(400, 'triangle', 0.05); // Rotation/Recolor sound
        
        set(state => ({ stats: { ...state.stats, operations: state.stats.operations + 1 } }));

        const { nodes, edges } = structureInstance.getNodesAndEdges();
        set({ nodes, edges });
      }

      await new Promise(resolve => setTimeout(resolve, 800 / speed));
    }
    
    set({ isAnimating: false });
  },

  triggerSort: async (sortType = 'BUBBLE') => {
    const { structureInstance, speed, structureType } = get();
    if (get().isAnimating || structureType !== 'TABLE') return;
    set({ isAnimating: true, stats: { operations: 0, comparisons: 0, swaps: 0 } });

    let generator;
    if (sortType === 'BUBBLE') generator = structureInstance.bubbleSort();
    else if (sortType === 'SELECTION') generator = structureInstance.selectionSort();
    else if (sortType === 'INSERTION') generator = structureInstance.insertionSort();
    else if (sortType === 'QUICK') generator = structureInstance.quickSort();
    else generator = structureInstance.bubbleSort();
    
    while (true) {
      const { value: step, done } = generator.next();
      if (done) break;

      if (step.type === 'HIGHLIGHT') {
        playBlip(600, 'square', 0.05);
        set(state => ({ stats: { ...state.stats, operations: state.stats.operations + 1, comparisons: step.isCompare ? state.stats.comparisons + 1 : state.stats.comparisons } }));
        if (step.tempNodes) {
          set({ nodes: step.tempNodes });
        }
      } else if (step.type === 'SWAP' || step.type === 'CLEAR_HIGHLIGHTS') {
        if (step.type === 'SWAP') {
           playBlip(400, 'sawtooth', 0.1);
           set(state => ({ stats: { ...state.stats, swaps: state.stats.swaps + 1, operations: state.stats.operations + 1 } }));
        }
        
        const { nodes, edges } = structureInstance.getNodesAndEdges();
        set({ nodes, edges });
      }

      await new Promise(resolve => setTimeout(resolve, 800 / speed));
    }
    
    set({ isAnimating: false });
  },

  triggerTraversal: async (traversalType) => {
    const { structureInstance, speed, structureType } = get();
    if (get().isAnimating || !['BST', 'RBT', 'GRAPH'].includes(structureType)) return;
    set({ isAnimating: true, traversalResult: [], currentTraversalType: traversalType, stats: { operations: 0, comparisons: 0, swaps: 0 } });

    let generator;
    if (traversalType === 'INORDER') generator = structureInstance.inorder();
    else if (traversalType === 'PREORDER') generator = structureInstance.preorder();
    else if (traversalType === 'POSTORDER') generator = structureInstance.postorder();
    else if (traversalType === 'BFS') generator = structureInstance.bfs();
    else if (traversalType === 'DFS') generator = structureInstance.dfs();
    else generator = structureInstance.bfs();
    
    // We will accumulate colored nodes to persist them
    let coloredNodeIds = new Set();

    while (true) {
      const { value: step, done } = generator.next();
      if (done) break;

      if (step.type === 'HIGHLIGHT') {
        playBlip(600, 'square', 0.05);
        set(state => ({ stats: { ...state.stats, operations: state.stats.operations + 1 } }));
        if (step.color === '#00a800') {
           coloredNodeIds.add(step.id);
           if (step.value !== undefined) {
             set(state => ({ traversalResult: [...state.traversalResult, step.value] }));
           }
        }
        
        const { nodes } = structureInstance.getNodesAndEdges();
        set({
          nodes: nodes.map(n => {
            if (n.id === step.id) return { ...n, color: step.color };
            if (coloredNodeIds.has(n.id)) return { ...n, color: '#00a800' };
            return n;
          })
        });
      } else if (step.type === 'CLEAR_HIGHLIGHTS') {
        const { nodes, edges } = structureInstance.getNodesAndEdges();
        set({ nodes, edges });
      }

      await new Promise(resolve => setTimeout(resolve, 800 / speed));
    }
    
    set({ isAnimating: false });
  }
}));
