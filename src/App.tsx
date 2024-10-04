// src/App.tsx

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Background,
    Controls,
    MiniMap,
    Connection,
    Edge,
    Node,
    NodeTypes,
    ConnectionLineType,
    OnNodesChange,
    OnEdgesChange,
} from 'react-flow-renderer';
import CustomNode from './components/NodeComponent';
import useUndo from 'use-undo';
import { useKeyPress } from 'react-use';

const nodeTypes: NodeTypes = {
    customNode: CustomNode,
};

const App: React.FC = () => {
    const [nodesState, nodesDispatch] = useUndo<Node[]>([]);
    const [edgesState, edgesDispatch] = useUndo<Edge[]>([]);

    const { present: nodes } = nodesState;
    const { present: edges } = edgesState;

    const setNodes = (newNodes: Node[]) => nodesDispatch.set(newNodes);
    const setEdges = (newEdges: Edge[]) => edgesDispatch.set(newEdges);

    const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
    const [connectionLineType, setConnectionLineType] = useState<ConnectionLineType>('step');
    const [selectionKeyPressed, setSelectionKeyPressed] = useState(false);

    const isCtrlPressed = useKeyPress('Control');

    useEffect(() => {
        setSelectionKeyPressed(isCtrlPressed);
    }, [isCtrlPressed]);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            const updatedNodes = applyNodeChanges(changes, nodes);
            setNodes(updatedNodes);
        },
        [nodes, setNodes]
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            const updatedEdges = applyEdgeChanges(changes, edges);
            setEdges(updatedEdges);
        },
        [edges, setEdges]
    );

    const onConnect = useCallback(
        (params: Edge | Connection) => {
            const newEdge = {
                ...params,
                type: connectionLineType,
                selectable: true,
            } as Edge;
            setEdges(addEdge(newEdge, edges));
        },
        [edges, setEdges, connectionLineType]
    );

    const onAddNode = () => {
        const newNode: Node = {
            id: `node_${+new Date()}`,
            type: 'customNode',
            data: {
                label: 'New Node',
                description: '',
                inputs: [],
                outputs: [],
                color: '#ffffff',
            },
            position: { x: 250, y: 5 },
        };
        setNodes([...nodes, newNode]);
    };

    const onConnectionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as ConnectionLineType;
        setConnectionLineType(newType);
        const updatedEdges = edges.map((edge) => ({ ...edge, type: newType }));
        setEdges(updatedEdges);
    };

    // Save and Load Diagram Functions
    const onSave = () => {
        const flow = { nodes, edges };
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(flow));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', 'diagram.json');
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const onLoad = (flowData: string) => {
        try {
            const flow = JSON.parse(flowData);
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
        } catch (error) {
            alert('Invalid JSON data');
        }
    };

    const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (event.target.files && event.target.files[0]) {
            fileReader.readAsText(event.target.files[0], 'UTF-8');
            fileReader.onload = (e) => {
                if (e.target && typeof e.target.result === 'string') {
                    onLoad(e.target.result);
                }
            };
        }
    };

    // Undo/Redo Actions
    const undo = () => {
        nodesDispatch.undo();
        edgesDispatch.undo();
    };

    const redo = () => {
        nodesDispatch.redo();
        edgesDispatch.redo();
    };

    const canUndo = nodesState.past.length > 0 || edgesState.past.length > 0;
    const canRedo = nodesState.future.length > 0 || edgesState.future.length > 0;

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();
                undo();
            } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
                event.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return (
        <div className="w-screen h-screen">
            <ReactFlowProvider>
                {/* Top Bar */}
                <div className="absolute z-10 p-2 m-2 flex space-x-2">
                    <button onClick={onAddNode} className="p-2 bg-blue-500 text-white rounded">
                        Add Node
                    </button>
                    <button onClick={onSave} className="p-2 bg-green-500 text-white rounded">
                        Save Diagram
                    </button>
                    <label className="p-2 bg-yellow-500 text-white rounded cursor-pointer">
                        Load Diagram
                        <input type="file" onChange={onFileUpload} className="hidden" accept=".json" />
                    </label>
                    <button
                        onClick={() => setSnapToGrid(!snapToGrid)}
                        className="p-2 bg-gray-500 text-white rounded"
                    >
                        Snap to Grid: {snapToGrid ? 'On' : 'Off'}
                    </button>
                    <select
                        value={connectionLineType}
                        onChange={onConnectionTypeChange}
                        className="p-2 bg-white rounded"
                    >
                        <option value="step">Step</option>
                        <option value="bezier">Bezier</option>
                        <option value="smoothstep">Smooth Step</option>
                        <option value="straight">Straight</option>
                    </select>
                </div>
                {/* Undo/Redo Buttons */}
                <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        className="p-2 bg-gray-300 rounded disabled:opacity-50"
                        title="Undo"
                    >
                        &#x21A9;
                    </button>
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        className="p-2 bg-gray-300 rounded disabled:opacity-50"
                        title="Redo"
                    >
                        &#x21AA;
                    </button>
                </div>
                {/* React Flow Component */}
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    snapToGrid={snapToGrid}
                    snapGrid={[15, 15]}
                    connectionLineType={connectionLineType}
                    multiSelectionKeyCode={selectionKeyPressed ? 'Control' : null}
                    deleteKeyCode={'Delete'}
                    fitView
                >
                    <Background variant="lines" gap={16} size={0.5} color="#e0e0e0" />
                    <Controls />
                    <MiniMap />
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    );
};

export default App;
