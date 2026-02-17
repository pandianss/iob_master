import { useMemo, useState, useEffect } from 'react';
import { Building2, Users, ShieldCheck, Briefcase } from 'lucide-react'; // Actually these ARE used in the future if I restore the complex renderer but for now let's just keep them or fix the lint.
// Wait, the lint says they are unused because I removed renderNode.
// I'll keep them but I need to make sure they are not flagged.
// I'll just remove the icons if they are truly not used in TreeRenderer.

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
    filter: 'functional' | 'branches';
}

interface TreeNode extends Department {
    children: TreeNode[];
}

export function OrgChart({ data, filter }: OrgChartProps) {
    const [userRole, setUserRole] = useState<string>('RO');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserRole(user.role || 'RO');
        }
    }, []);

    const tree = useMemo(() => {
        if (!data || data.length === 0) return null;
        // Root is strictly the Regional Office
        const root = data.find(d => d.subType === 'RO');
        if (!root) return null;

        const buildTree = (parentId: string): TreeNode[] => {
            return data
                .filter(d => d.parentId === parentId)
                .filter(d => {
                    // If we are at root, filter immediate children by the active tab
                    if (parentId === root.id) {
                        return filter === 'functional' ? d.subType === 'DEPT' : d.subType === 'BRANCH';
                    }
                    return true;
                })
                .map(d => ({ ...d, children: buildTree(d.id) }));
        };

        const rootNode: TreeNode = { ...root, children: buildTree(root.id) };
        return rootNode;
    }, [data, filter]);

    if (userRole === 'BRANCH') return null;

    if (!data || data.length === 0) {
        return (
            <div className="grid grid-cols-3 gap-6 p-12">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    // A recursive Flex-based renderer
    const TreeRenderer = ({ node }: { node: TreeNode }) => {
        let Icon = Building2;
        if (node.type === 'ADMINISTRATIVE') Icon = ShieldCheck;
        else if (node.type === 'FUNCTIONAL') Icon = Users;
        else if (node.type === 'EXECUTIVE') Icon = Briefcase;
        else if (node.type === 'GROUP') Icon = node.subType === 'BRANCH_GROUP' ? Briefcase : Users;

        return (
            <div className="flex flex-col items-center">
                <div className={`
                    flex flex-col items-center p-3 rounded-lg border shadow-sm z-10 relative
                    w-48 mb-8
                    ${node.type === 'ADMINISTRATIVE' ? 'bg-purple-50 border-purple-200 text-purple-900' :
                        node.type === 'EXECUTIVE' ? 'bg-green-50 border-green-200 text-green-900' :
                            node.type === 'GROUP' ? 'bg-gray-50 border-gray-300 text-gray-600 border-dashed' :
                                'bg-blue-50 border-blue-200 text-blue-900'}
                `}>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-300"
                        style={{ display: node.children.length > 0 ? 'block' : 'none' }}></div>

                    <div className="flex items-center space-x-2 mb-1">
                        <Icon className="w-3.5 h-3.5 opacity-60" />
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

                        {node.children.map((child) => (
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

    if (!tree) return <div className="text-gray-500 italic p-8 text-center w-full">No hierarchy data available for current selection</div>;

    return (
        <div className="overflow-auto p-12 flex justify-center min-h-[600px] bg-slate-50 rounded-xl border border-slate-200">
            <TreeRenderer node={tree} />
        </div>
    );
}
