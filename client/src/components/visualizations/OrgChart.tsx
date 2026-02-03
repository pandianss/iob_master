
import React, { useMemo } from 'react';
import { Building2, Users, ShieldCheck, Briefcase } from 'lucide-react';

interface Department {
    id: string;
    code: string;
    name: string;
    type: string;
    subType?: string;
    parentId?: string;
}

interface OrgChartProps {
    data: Department[];
}

interface TreeNode extends Department {
    children: TreeNode[];
}

export function OrgChart({ data }: OrgChartProps) {
    const tree = useMemo(() => {
        const idMapping = data.reduce((acc, el, i) => {
            acc[el.id] = i;
            return acc;
        }, {} as Record<string, number>);

        let root: TreeNode | null = null;
        const nodes: TreeNode[] = data.map(d => ({ ...d, children: [] }));

        nodes.forEach(el => {
            if (!el.parentId) {
                root = el;
                return;
            }
            const parentEl = nodes[idMapping[el.parentId]];
            if (parentEl) {
                parentEl.children.push(el);
            } else {
                // If parent not found, treat as root or orphan (put in generic root?)
                // For now, if no parent but has parentId, it's orphan. 
            }
        });
        return root;
    }, [data]);

    const renderNode = (node: TreeNode) => {
        let bgColor = 'bg-gray-100 border-gray-200 text-gray-800';
        let Icon = Building2;

        if (node.type === 'ADMINISTRATIVE') {
            bgColor = 'bg-purple-50 border-purple-200 text-purple-900';
            Icon = ShieldCheck;
        } else if (node.type === 'FUNCTIONAL') {
            bgColor = 'bg-blue-50 border-blue-200 text-blue-900';
            Icon = Users;
        } else if (node.type === 'EXECUTIVE') {
            bgColor = 'bg-green-50 border-green-200 text-green-900';
            Icon = Briefcase;
        }

        return (
            <div key={node.id} className="flex flex-col items-center">
                <div className={`
                    flex flex-col items-center p-3 rounded-lg border-2 shadow-sm
                    w-48 transition-all hover:shadow-md hover:scale-105 cursor-pointer
                    ${bgColor}
                `}>
                    <div className="flex items-center space-x-2 mb-1">
                        <Icon className="w-4 h-4 opacity-70" />
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                            {node.subType || node.type}
                        </span>
                    </div>
                    <div className="font-bold text-sm text-center leading-tight mb-1">{node.name}</div>
                    <div className="text-xs opacity-60 font-mono">{node.code}</div>
                </div>

                {node.children.length > 0 && (
                    <div className="flex flex-col items-center">
                        <div className="h-6 w-px bg-gray-300"></div>
                        <div className="flex space-x-8 relative">
                            {/* Horizontal connecting line */}
                            {node.children.length > 1 && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-gray-300 w-[calc(100%-12rem)]" style={{ top: -1 }}></div>
                            )}

                            {node.children.map((child, index) => (
                                <div key={child.id} className="flex flex-col items-center relative">
                                    {/* Connector from horizontal line to child */}
                                    {/* Only if multiple children, we need special connectors.
                                       Actually, standard org charts often use a UL/LI structure or specific CSS.
                                       Flexbox recursive approach:
                                    */}
                                    <div className="h-6 w-px bg-gray-300 absolute -top-6"></div>
                                    {renderNode(child)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // A recursive Flex-based renderer
    const TreeRenderer = ({ node }: { node: TreeNode }) => {
        return (
            <div className="flex flex-col items-center">
                <div className={`
                    flex flex-col items-center p-3 rounded-lg border shadow-sm z-10 relative
                    w-48 mb-8
                    ${node.type === 'ADMINISTRATIVE' ? 'bg-purple-50 border-purple-200 text-purple-900' :
                        node.type === 'EXECUTIVE' ? 'bg-green-50 border-green-200 text-green-900' :
                            'bg-blue-50 border-blue-200 text-blue-900'}
                `}>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-300"
                        style={{ display: node.children.length > 0 ? 'block' : 'none' }}></div>

                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                            {node.subType || node.type}
                        </span>
                    </div>
                    <div className="font-bold text-sm text-center leading-tight">{node.name}</div>
                    <div className="text-xs opacity-60 font-mono mt-1">{node.code}</div>
                </div>

                {node.children.length > 0 && (
                    <div className="flex items-start justify-center relative">
                        {/* Top horizontal connection bar */}
                        {node.children.length > 1 && (
                            <div className="absolute -top-4 bg-gray-300 h-px"
                                style={{ left: '2rem', right: '2rem' }}></div>
                        )}

                        {node.children.map((child, idx) => (
                            <div key={child.id} className="flex flex-col items-center px-4 relative">
                                <div className="h-4 w-px bg-gray-300 absolute -top-4"></div>
                                <TreeRenderer node={child} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    if (!tree) return <div className="text-gray-500 italic p-8">No hierarchy data available</div>;

    return (
        <div className="overflow-auto p-12 flex justify-center min-h-[600px] bg-slate-50 rounded-xl border border-slate-200">
            <TreeRenderer node={tree} />
        </div>
    );
}
