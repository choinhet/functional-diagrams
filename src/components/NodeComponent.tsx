// src/components/NodeComponent.tsx

import React, { useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'react-flow-renderer';
import { AiOutlinePlus, AiOutlineDelete, AiOutlineBgColors } from 'react-icons/ai';

const NodeComponent: React.FC<NodeProps> = ({ id, data }) => {
    const [label, setLabel] = useState<string>(data.label || '');
    const [description, setDescription] = useState<string>(data.description || '');
    const [color, setColor] = useState<string>(data.color || '#ffffff');
    const [inputs, setInputs] = useState<{ id: string; name: string }[]>(data.inputs || []);
    const [outputs, setOutputs] = useState<{ id: string; name: string }[]>(data.outputs || []);
    const { setNodes } = useReactFlow();

    const updateNodeData = (updatedData: any) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === id) {
                    node.data = { ...node.data, ...updatedData };
                }
                return node;
            })
        );
    };

    const addInput = () => {
        const newInput = { id: `input-${inputs.length}`, name: `Input ${inputs.length + 1}` };
        const newInputs = [...inputs, newInput];
        setInputs(newInputs);
        updateNodeData({ inputs: newInputs });
    };

    const addOutput = () => {
        const newOutput = { id: `output-${outputs.length}`, name: `Output ${outputs.length + 1}` };
        const newOutputs = [...outputs, newOutput];
        setOutputs(newOutputs);
        updateNodeData({ outputs: newOutputs });
    };

    const removeInput = (index: number) => {
        const newInputs = inputs.filter((_, i) => i !== index);
        setInputs(newInputs);
        updateNodeData({ inputs: newInputs });
    };

    const removeOutput = (index: number) => {
        const newOutputs = outputs.filter((_, i) => i !== index);
        setOutputs(newOutputs);
        updateNodeData({ outputs: newOutputs });
    };

    const renameInput = (index: number, newName: string) => {
        const newInputs = inputs.map((input, i) =>
            i === index ? { ...input, name: newName } : input
        );
        setInputs(newInputs);
        updateNodeData({ inputs: newInputs });
    };

    const renameOutput = (index: number, newName: string) => {
        const newOutputs = outputs.map((output, i) =>
            i === index ? { ...output, name: newName } : output
        );
        setOutputs(newOutputs);
        updateNodeData({ outputs: newOutputs });
    };

    const deleteNode = () => {
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
    };

    return (
        <div
            className="p-2 border rounded relative"
            style={{ backgroundColor: color, minWidth: '120px' }}
        >
            {/* Node Controls (Top-Left Corner) */}
            <div className="absolute top-1 left-1 flex space-x-1 items-center">
                <label
                    title="Change Node Color"
                    className="cursor-pointer text-gray-700 hover:text-gray-900 flex items-center"
                    style={{ padding: '2px' }}
                >
                    <AiOutlineBgColors size={16} />
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                            setColor(e.target.value);
                            updateNodeData({ color: e.target.value });
                        }}
                        className="hidden"
                    />
                </label>
                <button
                    onClick={deleteNode}
                    title="Delete Node"
                    className="text-red-500 hover:text-red-700 flex items-center"
                    style={{ padding: '2px', background: 'none', border: 'none' }}
                >
                    <AiOutlineDelete size={16} />
                </button>
            </div>
            {/* Block Name and Description */}
            <div className="mb-1 text-center mt-4">
                <input
                    type="text"
                    value={label}
                    onChange={(e) => {
                        setLabel(e.target.value);
                        updateNodeData({ label: e.target.value });
                    }}
                    className="bg-transparent text-center text-base font-bold w-full"
                    placeholder="Block Name"
                    style={{ outline: 'none', border: 'none' }}
                />
                <textarea
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value);
                        updateNodeData({ description: e.target.value });
                    }}
                    className="bg-transparent text-center text-xs w-full mt-1"
                    placeholder="Description"
                    style={{ outline: 'none', border: 'none', resize: 'none' }}
                    rows={2}
                />
            </div>
            {/* Inputs and Outputs */}
            <div className="flex justify-between">
                {/* Inputs */}
                <div className="flex flex-col items-start">
                    {inputs.map((input, index) => (
                        <div
                            key={input.id}
                            className="flex items-center group relative"
                            style={{ marginBottom: '2px' }}
                        >
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={input.id}
                                style={{ left: -8, top: '50%', transform: 'translateY(-50%)' }}
                            />
                            <input
                                type="text"
                                value={input.name}
                                onChange={(e) => renameInput(index, e.target.value)}
                                className="ml-1 bg-transparent text-xs"
                                style={{ outline: 'none', border: 'none', padding: 0, margin: 0 }}
                            />
                            {/* Delete IO Button */}
                            <button
                                onClick={() => removeInput(index)}
                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 absolute"
                                title="Remove Input"
                                style={{
                                    padding: '0 2px',
                                    background: 'none',
                                    border: 'none',
                                    left: 'calc(100% + 2px)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                }}
                            >
                                <AiOutlineDelete size={12} />
                            </button>
                        </div>
                    ))}
                    {/* Add Input Icon */}
                    <button
                        onClick={addInput}
                        className="text-blue-500 hover:text-blue-700 mt-1 flex items-center"
                        title="Add Input"
                        style={{ padding: '2px', background: 'none', border: 'none' }}
                    >
                        <AiOutlinePlus size={14} />
                    </button>
                </div>
                {/* Outputs */}
                <div className="flex flex-col items-end">
                    {outputs.map((output, index) => (
                        <div
                            key={output.id}
                            className="flex items-center group relative"
                            style={{ marginBottom: '2px' }}
                        >
                            {/* Delete IO Button */}
                            <button
                                onClick={() => removeOutput(index)}
                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 absolute"
                                title="Remove Output"
                                style={{
                                    padding: '0 2px',
                                    background: 'none',
                                    border: 'none',
                                    right: 'calc(100% + 2px)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                }}
                            >
                                <AiOutlineDelete size={12} />
                            </button>
                            <input
                                type="text"
                                value={output.name}
                                onChange={(e) => renameOutput(index, e.target.value)}
                                className="mr-1 bg-transparent text-xs text-right"
                                style={{ outline: 'none', border: 'none', padding: 0, margin: 0 }}
                            />
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={output.id}
                                style={{ right: -8, top: '50%', transform: 'translateY(-50%)' }}
                            />
                        </div>
                    ))}
                    {/* Add Output Icon */}
                    <button
                        onClick={addOutput}
                        className="text-blue-500 hover:text-blue-700 mt-1 flex items-center"
                        title="Add Output"
                        style={{ padding: '2px', background: 'none', border: 'none' }}
                    >
                        <AiOutlinePlus size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NodeComponent;
