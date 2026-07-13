import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { Button } from '../../../components/ui/button'
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, MarkerType, ReactFlow, ReactFlowProvider, SelectionMode, useReactFlow, useViewport, MiniMap } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Separator } from '../../../components/ui/separator'
import { NodeEditorModal } from './-components/node-editor-modal'
import { StickyNoteEditorModal } from './-components/sticky-note-editor-modal'
import { useToast } from '../../../hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog'
import {
    ArrowBigDownDash,
    BadgeCheckIcon,
    BriefcaseBusinessIcon,
    CloudCogIcon,
    DatabaseBackupIcon,
    DatabaseIcon,
    DatabaseZapIcon,
    FileCode2Icon,
    GitBranchIcon,
    GitForkIcon,
    ListTreeIcon,
    MessagesSquareIcon,
    Maximize2Icon,
    MinusIcon,
    MonitorCogIcon,
    MousePointerClickIcon,
    MoveIcon,
    OctagonXIcon,
    PencilLineIcon,
    PlayIcon,
    PlusIcon,
    RepeatIcon,
    SearchIcon,
    StepForwardIcon,
    StickyNotePlusIcon,
    TimerIcon,
    TriangleAlertIcon,
    TypeIcon,
    VariableIcon,
    ZoomInIcon,
} from 'lucide-react'
import type { ComponentType, DragEvent, MouseEvent as ReactMouseEvent } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/accordion'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuShortcut } from '../../../components/ui/context-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip'
import triggerManuallyNode from './-components/nodes/trigger-manually-node'
import triggerOnASchedulleNode from './-components/nodes/trigger-on-a-schedulle-node'
import clickByCoordinatesNode from './-components/nodes/click-by-coordinates-node'
import moveCursorNode from './-components/nodes/move-cursor-node'
import keypressNode from './-components/nodes/keypress-node'
import typeTextNode from './-components/nodes/type-text-node'
import windowsDataNode from './-components/nodes/windows-data-node'
import conditionalNode from './-components/nodes/conditional-node'
import delayNode from './-components/nodes/delay-node'
import loopNode from './-components/nodes/loop-node'
import nextItemNode from './-components/nodes/next-item-node'
import stopLoopNode from './-components/nodes/stop-loop-node'
import switchCaseNode from './-components/nodes/switch-case-node'
import postgresqlQueryNode from './-components/nodes/postgresql-query-node'
import mysqlQueryNode from './-components/nodes/mysql-query-node'
import sqliteQueryNode from './-components/nodes/sqlite-query-node'
import apiRequestNode from './-components/nodes/api-request-node'
import variableNode from './-components/nodes/variable-node'
import runJavascriptNode from './-components/nodes/run-javascript-node'
import actionsDialogNode from './-components/nodes/actions-dialog-node'
import alertDialogNode from './-components/nodes/alert-dialog-node'
import stickNoteNode from './-components/nodes/stick-note'
import actionEdge from './-components/action-edge'

type FlowSearch = {
    id?: string;
}

export const Route = createFileRoute('/dashboard/flow/')({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): FlowSearch => {
        return {
            id: search.id as string | undefined,
        }
    }
})

const nodeTypes = {
    trigger_manually: triggerManuallyNode,
    trigger_on_a_schedulle: triggerOnASchedulleNode,
    clickByCoordinatesNode,
    moveCursorNode,
    keypressNode,
    typeTextNode,
    windowsDataNode,
    conditionalNode,
    delayNode,
    loopNode,
    nextItemNode,
    stopLoopNode,
    switchCaseNode,
    postgresqlQueryNode,
    mysqlQueryNode,
    sqliteQueryNode,
    apiRequestNode,
    variableNode,
    runJavascriptNode,
    actionsDialogNode,
    alertDialogNode,
    stickNote: stickNoteNode,
};

const edgeTypes = {
    actionEdge,
};

type NodeTypeName = keyof typeof nodeTypes;

type NodeCatalogItem = {
    type: NodeTypeName;
    label: string;
    description: string;
    category: string;
    icon: ComponentType<{ className?: string }>;
};

type NodeCategory = {
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
    colorClassName: string;
    accentClassName: string;
    nodes: NodeCatalogItem[];
};

const nodeCategories: NodeCategory[] = [
    {
        title: 'Core',
        description: 'Start workflows, run code, call APIs and manage variables.',
        icon: BriefcaseBusinessIcon,
        colorClassName: 'text-teal-600',
        accentClassName: 'bg-teal-50 border-teal-100',
        nodes: [
            { type: 'trigger_manually', label: 'Trigger manually', description: 'Trigger manual', category: 'Core', icon: PlayIcon },
            { type: 'trigger_on_a_schedulle', label: 'Trigger on a schedule', description: 'Trigger by cron schedule', category: 'Core', icon: TimerIcon },
            { type: 'apiRequestNode', label: 'API Request', description: 'Make HTTP requests', category: 'Core', icon: CloudCogIcon },
            { type: 'variableNode', label: 'Variable', description: 'Create or update values', category: 'Core', icon: VariableIcon },
            { type: 'runJavascriptNode', label: 'Run Javascript', description: 'Execute custom code', category: 'Core', icon: FileCode2Icon },
        ],
    },
    {
        title: 'Flow',
        description: 'Branch, wait, loop and control execution.',
        icon: GitForkIcon,
        colorClassName: 'text-violet-600',
        accentClassName: 'bg-violet-50 border-violet-100',
        nodes: [
            { type: 'conditionalNode', label: 'Conditional', description: 'Branch with conditions', category: 'Flow', icon: GitBranchIcon },
            { type: 'switchCaseNode', label: 'Switch Case', description: 'Route by matching cases', category: 'Flow', icon: ListTreeIcon },
            { type: 'delayNode', label: 'Delay', description: 'Wait before continuing', category: 'Flow', icon: TimerIcon },
            { type: 'loopNode', label: 'Loop', description: 'Repeat a set of steps', category: 'Flow', icon: RepeatIcon },
            { type: 'nextItemNode', label: 'Next Item', description: 'Continue loop iteration', category: 'Flow', icon: StepForwardIcon },
            { type: 'stopLoopNode', label: 'Stop Loop', description: 'End the current loop', category: 'Flow', icon: OctagonXIcon },
        ],
    },
    {
        title: 'Windows',
        description: 'Automate mouse, keyboard and window data.',
        icon: MonitorCogIcon,
        colorClassName: 'text-sky-600',
        accentClassName: 'bg-sky-50 border-sky-100',
        nodes: [
            { type: 'windowsDataNode', label: 'Windows data', description: 'Read active window data', category: 'Windows', icon: MonitorCogIcon },
            { type: 'clickByCoordinatesNode', label: 'Click by coordinates', description: 'Click a point on screen', category: 'Windows', icon: MousePointerClickIcon },
            { type: 'moveCursorNode', label: 'Move cursor', description: 'Move the mouse pointer', category: 'Windows', icon: MoveIcon },
            { type: 'keypressNode', label: 'Key press', description: 'Press a keyboard key', category: 'Windows', icon: ArrowBigDownDash },
            { type: 'typeTextNode', label: 'Type text', description: 'Type text on keyboard', category: 'Windows', icon: TypeIcon },
        ],
    },
    {
        title: 'Data',
        description: 'Query databases and transform stored data.',
        icon: PencilLineIcon,
        colorClassName: 'text-indigo-600',
        accentClassName: 'bg-indigo-50 border-indigo-100',
        nodes: [
            { type: 'postgresqlQueryNode', label: 'PostgreSQL Query', description: 'Run a PostgreSQL query', category: 'Data', icon: DatabaseIcon },
            { type: 'mysqlQueryNode', label: 'MySQL Query', description: 'Run a MySQL query', category: 'Data', icon: DatabaseZapIcon },
            { type: 'sqliteQueryNode', label: 'SQLite Query', description: 'Run a SQLite query', category: 'Data', icon: DatabaseBackupIcon },
        ],
    },
    {
        title: 'Human review',
        description: 'Ask users to confirm, choose an action or read alerts.',
        icon: BadgeCheckIcon,
        colorClassName: 'text-emerald-600',
        accentClassName: 'bg-emerald-50 border-emerald-100',
        nodes: [
            { type: 'actionsDialogNode', label: 'Actions Dialog', description: 'Show action choices', category: 'Human review', icon: MessagesSquareIcon },
            { type: 'alertDialogNode', label: 'Alert Dialog', description: 'Show an alert message', category: 'Human review', icon: TriangleAlertIcon },
        ],
    },
];

const allNodeItems = nodeCategories.flatMap((category) => category.nodes);

function RouteComponent() {
    const { id } = Route.useSearch();
    return (
        <ReactFlowProvider>
            <FlowBuilder flowId={id} />
        </ReactFlowProvider>
    );
}

function FlowBuilder({ flowId }: { flowId?: string }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [nodes, setNodes] = useState<any[]>([]);
    const [edges, setEdges] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingNode, setEditingNode] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingSourceNodeId, setPendingSourceNodeId] = useState<string | null>(null);
    const [pendingSourceHandleId, setPendingSourceHandleId] = useState<string | null>(null);
    const [pendingInsertEdgeId, setPendingInsertEdgeId] = useState<string | null>(null);
    const [connectingSourceNodeId, setConnectingSourceNodeId] = useState<string | null>(null);
    const [connectingSourceHandleId, setConnectingSourceHandleId] = useState<string | null>(null);
    const { screenToFlowPosition, setViewport, getViewport, setCenter } = useReactFlow();

    const [clipboardNode, setClipboardNode] = useState<any>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const [renamingNode, setRenamingNode] = useState<any>(null);
    const [renameInputValue, setRenameInputValue] = useState<string>('');

    const [flowName, setFlowName] = useState("Carregando fluxo...");
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

    // Canvas empty flag
    const isCanvasEmpty = nodes.length === 0;

    // Sticky Note adder
    const addStickNote = useCallback(() => {
        const id = `stickNote_${Date.now()}`;
        const viewport = getViewport();
        const x = (window.innerWidth / 2 - viewport.x) / viewport.zoom - 130;
        const y = (window.innerHeight / 2 - viewport.y) / viewport.zoom - 80;
        
        const newNode = {
            id,
            type: 'stickNote',
            position: { x, y },
            style: { width: 260, height: 160 },
            data: {
                label: "I'm a note",
                description: "Double click to edit me. Guide",
            },
        };
        setNodes((nds) => nds.concat(newNode));
    }, [getViewport, setNodes]);

    // Search Node states and handlers
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const matchingNodes = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return nodes.filter(n => {
            const label = n.data?.label || n.type || '';
            return label.toLowerCase().includes(query);
        });
    }, [nodes, searchQuery]);
    
    const handleSelectSearchedNode = useCallback((nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            const x = node.position.x + (node.measured?.width ?? 260) / 2;
            const y = node.position.y + (node.measured?.height ?? 160) / 2;
            setCenter(x, y, { zoom: 1.2, duration: 800 });
            
            setNodes((nds) => nds.map((n) => ({
                ...n,
                selected: n.id === nodeId,
            })));
            
            setIsSearchModalOpen(false);
            setSearchQuery('');
        }
    }, [nodes, setCenter, setNodes]);

    // Flow name editing state and handlers
    const [isEditingName, setIsEditingName] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const handleNameClick = () => {
        setIsEditingName(true);
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 50);
    };
    
    const handleFlowNameBlur = async (newName: string) => {
        setIsEditingName(false);
        const trimmed = newName.trim();
        if (!trimmed || trimmed === flowName) return;
        
        setFlowName(trimmed);
        
        if (autoSaveEnabled) {
            try {
                await invoke("update_flow", { id: flowId, name: trimmed });
                toast({
                    title: "Nome atualizado!",
                    description: "O nome do fluxo foi atualizado automaticamente.",
                    variant: "success",
                });
            } catch (err) {
                console.error("Failed to auto-update flow name:", err);
                toast({
                    title: "Erro ao atualizar nome!",
                    description: "Não foi possível atualizar o nome automaticamente.",
                    variant: "destructive",
                });
            }
        }
    };

    const [viewportTrigger, setViewportTrigger] = useState(0);
    const [connectionStyle, setConnectionStyle] = useState({
        strokeWidth: 2,
        stroke: "#ececec",
    });
    const [zoomLimits, setZoomLimits] = useState({
        minZoom: 0.1,
        maxZoom: 3.0,
    });

    // Fetch settings on mount to determine autoSave status
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await invoke<any>("get_settings");
                setAutoSaveEnabled(settings?.autoSave ?? false);
                setConnectionStyle({
                    strokeWidth: settings?.connectionsStrokeWidth ?? 2,
                    stroke: settings?.connectionsStroke ?? "#ececec",
                });
                setZoomLimits({
                    minZoom: settings?.minZoom ?? 0.1,
                    maxZoom: settings?.maxZoom ?? 3.0,
                });
            } catch (err) {
                console.error("Failed to load settings in FlowBuilder:", err);
            }
        };
        fetchSettings();
    }, []);

    // Load flow data on mount
    useEffect(() => {
        if (!flowId) return;

        const loadFlow = async () => {
            try {
                const flow = await invoke<{ id: string; name: string }>("get_flow", { id: flowId });
                setFlowName(flow.name);
            } catch (err) {
                console.error("Falha ao carregar o fluxo:", err);
                setFlowName("Fluxo não encontrado");
            }
        };

        const loadFlowData = async () => {
            setIsLoading(true);
            try {
                const data = await invoke<{
                    nodes: any[];
                    edges: any[];
                    zoom: number;
                    viewportX: number;
                    viewportY: number;
                }>("get_flow_data", { flowId });

                if (data.nodes && data.nodes.length > 0) {
                    const mappedNodes = data.nodes.map(n => {
                        const parsedData = n.data ? JSON.parse(n.data) : {};
                        return {
                            id: n.id,
                            type: n.type,
                            position: { x: n.x, y: n.y },
                            style: parsedData.style || (n.type === 'stickNote' ? { width: 260, height: 160 } : undefined),
                            data: {
                                label: n.label,
                                alias: parsedData.alias || n.id.replace(/-/g, '_'),
                                parameters: parsedData.parameters || {},
                                output: parsedData.output || null
                            }
                        };
                    });

                    const mappedEdges = data.edges.map(e => ({
                        id: e.id,
                        source: e.source,
                        target: e.target,
                        type: e.type || undefined,
                        sourceHandle: e.sourceHandle || undefined,
                        targetHandle: e.targetHandle || undefined,
                        data: e.data ? JSON.parse(e.data) : undefined
                    }));

                    setNodes(mappedNodes);
                    setEdges(mappedEdges);
                } else {
                    setNodes([]);
                    setEdges([]);
                }

                // Restore viewport position and zoom
                setTimeout(() => {
                    setViewport({
                        x: data.viewportX ?? 0,
                        y: data.viewportY ?? 0,
                        zoom: data.zoom ?? 1
                    });
                }, 50);
            } catch (err) {
                console.error("Failed to load flow data:", err);
                setNodes([]);
                setEdges([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadFlow();
        loadFlowData();
    }, [flowId]);

    // Debounced auto-save (triggers only if autoSaveEnabled is true)
    useEffect(() => {
        if (isLoading || !flowId || !autoSaveEnabled) return;

        const saveTimer = setTimeout(async () => {
            try {
                const backendNodes = nodes.map(n => ({
                    id: n.id,
                    type: n.type,
                    label: n.data?.label || n.type,
                    x: n.position.x,
                    y: n.position.y,
                    data: JSON.stringify({
                        alias: n.data?.alias || n.id.replace(/-/g, '_'),
                        parameters: n.data?.parameters || {},
                        output: n.data?.output || null,
                        style: n.style || undefined
                    })
                }));

                const backendEdges = edges.map(e => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    type: e.type || null,
                    sourceHandle: e.sourceHandle || null,
                    targetHandle: e.targetHandle || null,
                    data: e.data ? JSON.stringify(e.data) : null
                }));

                const { x: vx, y: vy, zoom: vz } = getViewport();

                await invoke("save_flow_data", {
                    flowId,
                    nodes: backendNodes,
                    edges: backendEdges,
                    zoom: vz,
                    viewportX: vx,
                    viewportY: vy
                });
            } catch (err) {
                console.error("Failed to auto-save flow data:", err);
            }
        }, 1500);

        return () => clearTimeout(saveTimer);
    }, [nodes, edges, flowId, isLoading, autoSaveEnabled, viewportTrigger]);

    const onNodeDoubleClick = useCallback((_event: any, node: any) => {
        setEditingNode(node);
    }, []);

    const onMoveEnd = useCallback(() => {
        setViewportTrigger(prev => prev + 1);
    }, []);

    const copyNode = useCallback((node: any) => {
        if (!node) return;
        const selectedNodes = nodes.filter((n: any) => n.selected);
        const nodesToCopy = selectedNodes.length > 1 ? selectedNodes : [node];
        
        const nodeIds = new Set(nodesToCopy.map((n: any) => n.id));
        const edgesToCopy = edges.filter((e: any) => nodeIds.has(e.source) && nodeIds.has(e.target));

        setClipboardNode({
            nodes: nodesToCopy,
            edges: edgesToCopy
        });

        toast({
            title: selectedNodes.length > 1 ? "Nodes copiados!" : "Node copiado!",
            description: `${nodesToCopy.length} nodes e ${edgesToCopy.length} conexões copiados.`,
        });
    }, [toast, nodes, edges]);

    const pasteNode = useCallback((clientX?: number, clientY?: number) => {
        const clipboardNodes = clipboardNode?.nodes || [];
        const clipboardEdges = clipboardNode?.edges || [];
        if (clipboardNodes.length === 0) return;

        const triggersToPaste = clipboardNodes.filter((n: any) => n.type === 'trigger_manually' || n.type === 'trigger_on_a_schedulle');
        const triggerAlreadyInFlow = nodes.some((n: any) => n.type === 'trigger_manually' || n.type === 'trigger_on_a_schedulle');
        if (triggersToPaste.length > 0 && triggerAlreadyInFlow) {
            toast({
                title: "Erro ao colar",
                description: "Cada fluxo pode conter apenas 1 node do tipo Trigger.",
                variant: "destructive"
            });
            return;
        }

        const x = clientX ?? mouseRef.current.x;
        const y = clientY ?? mouseRef.current.y;
        const targetPos = screenToFlowPosition({ x, y }, { snapToGrid: true, snapGrid: [20, 20] });

        let minX = Infinity;
        let minY = Infinity;
        clipboardNodes.forEach((n: any) => {
            const px = n.position?.x ?? 0;
            const py = n.position?.y ?? 0;
            if (px < minX) minX = px;
            if (py < minY) minY = py;
        });
        if (minX === Infinity) minX = 0;
        if (minY === Infinity) minY = 0;

        const idMap = new Map<string, string>();

        const newNodes = clipboardNodes.map((n: any) => {
            const newNodeId = `${n.type}-${crypto.randomUUID()}`;
            idMap.set(n.id, newNodeId);
            const offsetX = (n.position?.x ?? 0) - minX;
            const offsetY = (n.position?.y ?? 0) - minY;
            return {
                id: newNodeId,
                type: n.type,
                position: {
                    x: targetPos.x + offsetX,
                    y: targetPos.y + offsetY,
                },
                style: n.style || (n.type === 'stickNote' ? { width: 260, height: 160 } : undefined),
                selected: true,
                data: {
                    ...n.data,
                    label: `${n.data?.label || n.type} (Copy)`,
                    alias: `${n.data?.alias || newNodeId.replace(/-/g, '_')}_copy`,
                    output: null,
                }
            };
        });

        const newEdges = clipboardEdges.map((e: any) => {
            const newSource = idMap.get(e.source);
            const newTarget = idMap.get(e.target);
            if (newSource && newTarget) {
                return {
                    ...e,
                    id: `${newSource}-${newTarget}`,
                    source: newSource,
                    target: newTarget,
                    selected: true,
                };
            }
            return null;
        }).filter(Boolean);

        setTimeout(() => {
            setNodes((prevNodes) => prevNodes.map((n: any) => ({ ...n, selected: false })).concat(newNodes));
            setEdges((prevEdges) => prevEdges.map((e: any) => ({ ...e, selected: false })).concat(newEdges as any[]));
        }, 0);

        toast({
            title: clipboardNodes.length > 1 ? "Nodes colados!" : "Node colado!",
            description: `${newNodes.length} nodes e ${newEdges.length} conexões colados.`,
            variant: "success",
        });
    }, [clipboardNode, screenToFlowPosition, toast, nodes]);

    const pasteBefore = useCallback((targetNode: any) => {
        const clipboardNodes = clipboardNode?.nodes || [];
        const clipboardEdges = clipboardNode?.edges || [];
        if (clipboardNodes.length === 0 || !targetNode) return;

        const triggersToPaste = clipboardNodes.filter((n: any) => n.type === 'trigger_manually' || n.type === 'trigger_on_a_schedulle');
        const triggerAlreadyInFlow = nodes.some((n: any) => n.type === 'trigger_manually' || n.type === 'trigger_on_a_schedulle');
        if (triggersToPaste.length > 0 && triggerAlreadyInFlow) {
            toast({
                title: "Erro ao colar",
                description: "Cada fluxo pode conter apenas 1 node do tipo Trigger.",
                variant: "destructive"
            });
            return;
        }

        let minX = Infinity;
        let minY = Infinity;
        clipboardNodes.forEach((n: any) => {
            const px = n.position?.x ?? 0;
            const py = n.position?.y ?? 0;
            if (px < minX) minX = px;
            if (py < minY) minY = py;
        });
        if (minX === Infinity) minX = 0;
        if (minY === Infinity) minY = 0;

        const basePosition = {
            x: targetNode.position.x - 180,
            y: targetNode.position.y,
        };

        const idMap = new Map<string, string>();

        const newNodes = clipboardNodes.map((n: any) => {
            const newNodeId = `${n.type}-${crypto.randomUUID()}`;
            idMap.set(n.id, newNodeId);
            const offsetX = (n.position?.x ?? 0) - minX;
            const offsetY = (n.position?.y ?? 0) - minY;
            return {
                id: newNodeId,
                type: n.type,
                position: {
                    x: basePosition.x + offsetX,
                    y: basePosition.y + offsetY,
                },
                style: n.style || (n.type === 'stickNote' ? { width: 260, height: 160 } : undefined),
                selected: true,
                data: {
                    ...n.data,
                    label: `${n.data?.label || n.type} (Copy)`,
                    alias: `${n.data?.alias || newNodeId.replace(/-/g, '_')}_copy`,
                    output: null,
                }
            };
        });

        const newEdges = clipboardEdges.map((e: any) => {
            const newSource = idMap.get(e.source);
            const newTarget = idMap.get(e.target);
            if (newSource && newTarget) {
                return {
                    ...e,
                    id: `${newSource}-${newTarget}`,
                    source: newSource,
                    target: newTarget,
                    selected: true,
                };
            }
            return null;
        }).filter(Boolean);

        setTimeout(() => {
            setNodes((prev) => prev.map((n: any) => ({ ...n, selected: false })).concat(newNodes));

            setEdges((prevEdges) => {
                const deselectedEdges = prevEdges.map((e: any) => ({ ...e, selected: false }));
                let resultEdges = [...deselectedEdges, ...(newEdges as any[])];

                if (newNodes.length === 1) {
                    const newNodeId = newNodes[0].id;
                    const incomingEdges = deselectedEdges.filter((e) => e.target === targetNode.id);
                    const otherEdges = deselectedEdges.filter((e) => e.target !== targetNode.id);

                    const modifiedIncoming = incomingEdges.map((e) => ({
                        ...e,
                        target: newNodeId,
                        id: `${e.source}-${newNodeId}`,
                    }));

                    const newEdge = {
                        id: `${newNodeId}-${targetNode.id}`,
                        source: newNodeId,
                        target: targetNode.id,
                        type: 'actionEdge',
                        selected: true,
                    };

                    resultEdges = [...otherEdges, ...modifiedIncoming, newEdge, ...(newEdges as any[])];
                }
                return resultEdges;
            });
        }, 0);

        toast({
            title: clipboardNodes.length > 1 ? "Nodes colados antes" : "Node colado antes",
            description: `Inserido antes de "${targetNode.data?.label || targetNode.type}".`,
            variant: "success",
        });
    }, [clipboardNode, toast, nodes]);

    const pasteAfter = useCallback((targetNode: any) => {
        const clipboardNodes = clipboardNode?.nodes || [];
        const clipboardEdges = clipboardNode?.edges || [];
        if (clipboardNodes.length === 0 || !targetNode) return;

        const triggersToPaste = clipboardNodes.filter((n: any) => n.type === 'trigger_manually' || n.type === 'trigger_on_a_schedulle');
        const triggerAlreadyInFlow = nodes.some((n: any) => n.type === 'trigger_manually' || n.type === 'trigger_on_a_schedulle');
        if (triggersToPaste.length > 0 && triggerAlreadyInFlow) {
            toast({
                title: "Erro ao colar",
                description: "Cada fluxo pode conter apenas 1 node do tipo Trigger.",
                variant: "destructive"
            });
            return;
        }

        let minX = Infinity;
        let minY = Infinity;
        clipboardNodes.forEach((n: any) => {
            const px = n.position?.x ?? 0;
            const py = n.position?.y ?? 0;
            if (px < minX) minX = px;
            if (py < minY) minY = py;
        });
        if (minX === Infinity) minX = 0;
        if (minY === Infinity) minY = 0;

        const basePosition = {
            x: targetNode.position.x + 180,
            y: targetNode.position.y,
        };

        const idMap = new Map<string, string>();

        const newNodes = clipboardNodes.map((n: any) => {
            const newNodeId = `${n.type}-${crypto.randomUUID()}`;
            idMap.set(n.id, newNodeId);
            const offsetX = (n.position?.x ?? 0) - minX;
            const offsetY = (n.position?.y ?? 0) - minY;
            return {
                id: newNodeId,
                type: n.type,
                position: {
                    x: basePosition.x + offsetX,
                    y: basePosition.y + offsetY,
                },
                style: n.style || (n.type === 'stickNote' ? { width: 260, height: 160 } : undefined),
                selected: true,
                data: {
                    ...n.data,
                    label: `${n.data?.label || n.type} (Copy)`,
                    alias: `${n.data?.alias || newNodeId.replace(/-/g, '_')}_copy`,
                    output: null,
                }
            };
        });

        const newEdges = clipboardEdges.map((e: any) => {
            const newSource = idMap.get(e.source);
            const newTarget = idMap.get(e.target);
            if (newSource && newTarget) {
                return {
                    ...e,
                    id: `${newSource}-${newTarget}`,
                    source: newSource,
                    target: newTarget,
                    selected: true,
                };
            }
            return null;
        }).filter(Boolean);

        setTimeout(() => {
            setNodes((prev) => prev.map((n: any) => ({ ...n, selected: false })).concat(newNodes));

            setEdges((prevEdges) => {
                const deselectedEdges = prevEdges.map((e: any) => ({ ...e, selected: false }));
                let resultEdges = [...deselectedEdges, ...(newEdges as any[])];

                if (newNodes.length === 1) {
                    const newNodeId = newNodes[0].id;
                    const outgoingEdges = deselectedEdges.filter((e) => e.source === targetNode.id);
                    const otherEdges = deselectedEdges.filter((e) => e.source !== targetNode.id);

                    const modifiedOutgoing = outgoingEdges.map((e: any) => ({
                        ...e,
                        source: newNodeId,
                        id: `${newNodeId}-${e.target}`,
                    }));

                    const newEdge = {
                        id: `${targetNode.id}-${newNodeId}`,
                        source: targetNode.id,
                        target: newNodeId,
                        type: 'actionEdge',
                        selected: true,
                    };

                    resultEdges = [...otherEdges, ...modifiedOutgoing, newEdge, ...(newEdges as any[])];
                }
                return resultEdges;
            });
        }, 0);

        toast({
            title: clipboardNodes.length > 1 ? "Nodes colados depois" : "Node colado depois",
            description: `Inserido depois de "${targetNode.data?.label || targetNode.type}".`,
            variant: "success",
        });
    }, [clipboardNode, toast, nodes]);

    const duplicateNode = useCallback((node: any) => {
        if (!node) return;
        const selectedNodes = nodes.filter((n: any) => n.selected);
        const nodesToDuplicate = selectedNodes.length > 1 ? selectedNodes : [node];

        const triggersToDuplicate = nodesToDuplicate.filter((n: any) => n.type === 'trigger_manually' || n.type === 'trigger_on_a_schedulle');
        const triggerAlreadyInFlow = nodes.some((n: any) => n.type === 'trigger_manually' || n.type === 'trigger_on_a_schedulle');
        
        if (triggersToDuplicate.length > 0 && triggerAlreadyInFlow) {
            toast({
                title: "Erro ao duplicar",
                description: "Cada fluxo pode conter apenas 1 node do tipo Trigger.",
                variant: "destructive"
            });
            return;
        }

        const idMap = new Map<string, string>();

        const newNodes = nodesToDuplicate.map((n: any) => {
            const newNodeId = `${n.type}-${crypto.randomUUID()}`;
            idMap.set(n.id, newNodeId);
            return {
                id: newNodeId,
                type: n.type,
                position: {
                    x: n.position.x + 50,
                    y: n.position.y + 50,
                },
                style: n.style || (n.type === 'stickNote' ? { width: 260, height: 160 } : undefined),
                selected: true,
                data: {
                    ...n.data,
                    label: `${n.data?.label || n.type} (Copy)`,
                    alias: `${n.data?.alias || newNodeId.replace(/-/g, '_')}_copy`,
                    output: null,
                }
            };
        });

        const nodeIds = new Set(nodesToDuplicate.map((n: any) => n.id));
        const internalEdges = edges.filter((e: any) => nodeIds.has(e.source) && nodeIds.has(e.target));

        const newEdges = internalEdges.map((e: any) => {
            const newSource = idMap.get(e.source);
            const newTarget = idMap.get(e.target);
            if (newSource && newTarget) {
                return {
                    ...e,
                    id: `${newSource}-${newTarget}`,
                    source: newSource,
                    target: newTarget,
                    selected: true,
                };
            }
            return null;
        }).filter(Boolean);

        setTimeout(() => {
            setNodes((prev) => prev.map((n: any) => ({ ...n, selected: false })).concat(newNodes));
            setEdges((prev) => prev.map((e: any) => ({ ...e, selected: false })).concat(newEdges as any[]));
        }, 0);

        toast({
            title: nodesToDuplicate.length > 1 ? "Nodes duplicados!" : "Node duplicado!",
            description: `${newNodes.length} nodes e ${newEdges.length} conexões duplicados com sucesso.`,
            variant: "success",
        });
    }, [toast, nodes, edges]);

    const renameNode = useCallback((node: any) => {
        if (!node) return;
        setRenamingNode(node);
        setRenameInputValue(node.data?.label || node.type);
    }, []);

    const handleSaveRename = useCallback(() => {
        if (!renamingNode) return;
        const trimmed = renameInputValue.trim();
        if (!trimmed) {
            toast({ title: "Erro", description: "Nome inválido.", variant: "destructive" });
            return;
        }

        setNodes((prev) =>
            prev.map((n) => {
                if (n.id === renamingNode.id) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            label: trimmed,
                            alias: trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                        },
                    };
                }
                return n;
            })
        );
        toast({ title: "Node renomeado", description: `Renomeado para "${trimmed}".`, variant: "success" });
        setRenamingNode(null);
    }, [renamingNode, renameInputValue, toast]);

    const executeStep = useCallback((node: any) => {
        let mockOutput: any = {};
        const params = node.data?.parameters || {};

        switch (node.type) {
            case "clickByCoordinatesNode":
                mockOutput = {
                    action: "click",
                    coordinates: { x: Number(params.x) || 100, y: Number(params.y) || 200 },
                    timestamp: new Date().toISOString(),
                };
                break;
            case "moveCursorNode":
                mockOutput = {
                    action: "move",
                    coordinates: { x: Number(params.x) || 0, y: Number(params.y) || 0 },
                    timestamp: new Date().toISOString(),
                };
                break;
            case "keypressNode":
                mockOutput = {
                    action: "key_press",
                    key: params.key || "enter",
                    count: Number(params.count) || 1,
                    timestamp: new Date().toISOString(),
                };
                break;
            case "typeTextNode":
                mockOutput = {
                    action: "type",
                    text: params.text || "",
                    charCount: (params.text || "").length,
                    timestamp: new Date().toISOString(),
                };
                break;
            case "delayNode":
                mockOutput = {
                    action: "wait",
                    ms: Number(params.ms) || 1000,
                    status: "completed",
                };
                break;
            case "loopNode":
                mockOutput = {
                    action: "loop_start",
                    iterations: Number(params.iterations) || 10,
                    currentIndex: 0,
                };
                break;
            case "apiRequestNode":
                mockOutput = {
                    status: 200,
                    statusText: "OK",
                    method: params.method || "GET",
                    url: params.url || "https://api.example.com/data",
                    data: {
                        id: Math.floor(Math.random() * 1000),
                        message: "Dados de resposta da API simulados com sucesso!",
                        received_body: params.body || null,
                    },
                };
                break;
            case "sqliteQueryNode":
            case "postgresqlQueryNode":
            case "mysqlQueryNode":
                mockOutput = {
                    success: true,
                    query: params.query || "",
                    connection_id: params.connection || "default",
                    records: [
                        { id: 1, name: "Item A", description: "Record mock from DB" },
                        { id: 2, name: "Item B", description: "Record mock from DB" },
                    ],
                };
                break;
            case "variableNode":
                mockOutput = {
                    variable: params.name || "my_variable",
                    value: params.value || "",
                    type: typeof params.value,
                };
                break;
            case "runJavascriptNode":
                mockOutput = {
                    success: true,
                    result: "Javascript evaluated successfully",
                    timestamp: new Date().toISOString(),
                };
                break;
            case "actionsDialogNode":
            case "alertDialogNode":
                mockOutput = {
                    dialog_shown: true,
                    message: params.message || "",
                    user_response: "ok",
                };
                break;
            default:
                mockOutput = {
                    status: "executed",
                    timestamp: new Date().toISOString(),
                };
        }

        setNodes((prev) =>
            prev.map((n) => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            output: mockOutput,
                        },
                    };
                }
                return n;
            })
        );

        toast({
            title: "Passo executado!",
            description: `Simulação concluída para o node "${node.data?.label || node.type}".`,
            variant: "success",
        });
    }, [toast]);

    const deleteNode = useCallback((nodeId: string) => {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 1) {
            const selectedIds = new Set(selectedNodes.map(n => n.id));
            setNodes((prev) => prev.filter((n) => !selectedIds.has(n.id)));
            setEdges((prev) => prev.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)));
            toast({ title: "Nodes excluídos", description: `${selectedNodes.length} nodes removidos com sucesso.` });
        } else {
            setNodes((prev) => prev.filter((n) => n.id !== nodeId));
            setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
            toast({ title: "Node excluído", description: "Node removido com sucesso." });
        }
    }, [toast, nodes]);

    const deleteSelected = useCallback(() => {
        setNodes((prev) => prev.filter((n) => !n.selected));
        setEdges((prev) => prev.filter((e) => !e.selected));
        toast({ title: "Seleção excluída", description: "Itens selecionados removidos com sucesso." });
    }, [toast]);

    const selectAll = useCallback(() => {
        setNodes((prev) => prev.map((n) => ({ ...n, selected: true })));
    }, []);

    const clearSelection = useCallback(() => {
        setNodes((prev) => prev.map((n) => ({ ...n, selected: false })));
    }, []);

    const handleSaveNodeDetails = (nodeId: string, name: string, alias: string, parameters: any, output: any) => {
        setNodes(prev => prev.map(n => {
            if (n.id === nodeId) {
                return {
                    ...n,
                    data: {
                        ...n.data,
                        label: name,
                        alias,
                        parameters,
                        output
                    }
                };
            }
            return n;
        }));
        setEditingNode(null);
    };

    // Native ReactFlow handles Ctrl key activation internally via panActivationKeyCode

    const filteredCategories = useMemo(() => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        if (!normalizedSearchTerm) {
            return nodeCategories;
        }

        return nodeCategories
            .map((category) => ({
                ...category,
                nodes: category.nodes.filter((node) => {
                    return [node.label, node.description, node.category]
                        .some((value) => value.toLowerCase().includes(normalizedSearchTerm));
                }),
            }))
            .filter((category) => category.nodes.length > 0);
    }, [searchTerm]);

    const openNodePickerFromNode = useCallback((sourceNodeId: string, sourceHandleId?: string) => {
        setPendingSourceNodeId(sourceNodeId);
        setPendingSourceHandleId(sourceHandleId ?? null);
        setPendingInsertEdgeId(null);
        setIsSidebarOpen(true);
    }, []);

    const deleteEdge = useCallback((edgeId: string) => {
        setEdges((edgesSnapshot) => edgesSnapshot.filter((edge) => edge.id !== edgeId));
    }, []);

    const openNodePickerFromEdge = useCallback((edgeId: string) => {
        setPendingSourceNodeId(null);
        setPendingInsertEdgeId(edgeId);
        setIsSidebarOpen(true);
    }, []);

    const selectSingleNode = useCallback((nodeId: string) => {
        setNodes((prev) =>
            prev.map((n) => ({
                ...n,
                selected: n.id === nodeId,
            }))
        );
    }, []);

    const renderedNodes = useMemo(() => {
        const selectedCount = nodes.filter((n) => n.selected).length;
        const hasMultipleSelection = selectedCount > 1;
        return nodes.map((node) => ({
            ...node,
            zIndex: node.type === 'stickNote' ? -10 : 1,
            data: {
                ...node.data,
                selectedCount,
                hasMultipleSelection,
                hasOutgoingConnection: edges.some((edge) => edge.source === node.id),
                connectedSourceHandles: edges.filter((edge) => edge.source === node.id).map((edge) => edge.sourceHandle ?? 'b'),
                connectingSourceNodeId,
                connectingSourceHandleId,
                onAddNext: openNodePickerFromNode,
                clipboardNodeExists: clipboardNode && clipboardNode.nodes && clipboardNode.nodes.length > 0,
                onSelect: () => selectSingleNode(node.id),
                onOpen: () => setEditingNode(node),
                onExecuteStep: () => executeStep(node),
                onRename: () => renameNode(node),
                onCopy: () => copyNode(node),
                onDuplicate: () => duplicateNode(node),
                onPasteBefore: () => pasteBefore(node),
                onPasteAfter: () => pasteAfter(node),
                onSelectAll: selectAll,
                onClearSelection: clearSelection,
                onDelete: () => deleteNode(node.id),
            },
        }));
    }, [
        connectingSourceNodeId,
        connectingSourceHandleId,
        edges,
        nodes,
        openNodePickerFromNode,
        clipboardNode,
        executeStep,
        renameNode,
        copyNode,
        duplicateNode,
        pasteBefore,
        pasteAfter,
        selectAll,
        clearSelection,
        deleteNode,
        selectSingleNode,
    ]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const activeEl = document.activeElement;
            const isEditing = activeEl && (
                activeEl.tagName === 'INPUT' ||
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.tagName === 'SELECT' ||
                activeEl.getAttribute('contenteditable') === 'true'
            );

            if (isEditing) return;

            const selectedNode = nodes.find(n => n.selected);

            if (event.key === 'Enter') {
                if (selectedNode) {
                    event.preventDefault();
                    setEditingNode(selectedNode);
                }
            }

            if (event.key === ' ') {
                if (selectedNode) {
                    event.preventDefault();
                    renameNode(selectedNode);
                }
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
                if (selectedNode) {
                    event.preventDefault();
                    executeStep(selectedNode);
                }
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
                if (selectedNode) {
                    event.preventDefault();
                    copyNode(selectedNode);
                }
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
                if (selectedNode) {
                    event.preventDefault();
                    duplicateNode(selectedNode);
                }
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
                event.preventDefault();
                pasteNode();
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                selectAll();
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                clearSelection();
            }

            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                deleteSelected();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [
        nodes,
        copyNode,
        pasteNode,
        duplicateNode,
        renameNode,
        executeStep,
        selectAll,
        clearSelection,
        deleteSelected,
    ]);

    const renderedEdges = useMemo(() => {
        return edges.map((edge) => ({
            ...edge,
            type: edge.type ?? 'actionEdge',
            style: {
                strokeWidth: connectionStyle.strokeWidth,
                stroke: connectionStyle.stroke,
                ...edge.style,
            },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: connectionStyle.stroke,
                strokeWidth: connectionStyle.strokeWidth,

            },
            data: {
                ...edge.data,
                onDeleteEdge: deleteEdge,
                onInsertNode: openNodePickerFromEdge,
            },
        }));
    }, [deleteEdge, edges, openNodePickerFromEdge, connectionStyle]);

    const createNode = useCallback((type: NodeTypeName, clientX?: number, clientY?: number, sourceNodeId?: string | null, insertEdgeId?: string | null) => {
        // Block duplicate trigger nodes
        const isTrigger = type === 'trigger_manually' || type === 'trigger_on_a_schedulle';
        if (isTrigger) {
            const hasTrigger = nodes.some(n => n.type === 'trigger_manually' || n.type === 'trigger_on_a_schedulle');
            if (hasTrigger) {
                toast({
                    title: "Erro ao adicionar node",
                    description: "Cada fluxo pode conter apenas 1 node do tipo Trigger.",
                    variant: "destructive"
                });
                return;
            }
        }

        const item = allNodeItems.find((node) => node.type === type);
        const sourceNode = sourceNodeId ? nodes.find((node) => node.id === sourceNodeId) : undefined;
        const insertEdge = insertEdgeId ? edges.find((edge) => edge.id === insertEdgeId) : undefined;
        const insertSourceNode = insertEdge ? nodes.find((node) => node.id === insertEdge.source) : undefined;
        const insertTargetNode = insertEdge ? nodes.find((node) => node.id === insertEdge.target) : undefined;
        const position = clientX !== undefined && clientY !== undefined
            ? screenToFlowPosition({
                x: clientX,
                y: clientY,
            }, {
                snapToGrid: true,
                snapGrid: [20, 20],
            })
            : {
                x: sourceNode
                    ? sourceNode.position.x + 180
                    : insertSourceNode && insertTargetNode
                        ? Math.round(((insertSourceNode.position.x + insertTargetNode.position.x) / 2) / 20) * 20
                        : screenToFlowPosition({
                            x: window.innerWidth / 2,
                            y: window.innerHeight / 2,
                        }, {
                            snapToGrid: true,
                            snapGrid: [20, 20],
                        }).x,
                y: sourceNode
                    ? sourceNode.position.y
                    : insertSourceNode && insertTargetNode
                        ? Math.round(((insertSourceNode.position.y + insertTargetNode.position.y) / 2) / 20) * 20
                        : screenToFlowPosition({
                            x: window.innerWidth / 2,
                            y: window.innerHeight / 2,
                        }, {
                            snapToGrid: true,
                            snapGrid: [20, 20],
                        }).y,
            };
        const newNodeId = `${type}-${crypto.randomUUID()}`;

        setNodes((nodesSnapshot) => [
            ...nodesSnapshot,
            {
                id: newNodeId,
                type,
                position,
                data: { label: item?.label ?? type },
            },
        ]);

        if (sourceNodeId) {
            setEdges((edgesSnapshot) => {
                const sourceHandle = pendingSourceHandleId || undefined;
                const filtered = edgesSnapshot.filter(
                    (edge) => !(edge.source === sourceNodeId && edge.sourceHandle === sourceHandle)
                );
                return addEdge({
                    id: `${sourceNodeId}-${newNodeId}`,
                    source: sourceNodeId,
                    sourceHandle,
                    target: newNodeId,
                    type: 'actionEdge',
                }, filtered);
            });
        }

        if (insertEdge) {
            setEdges((edgesSnapshot) => [
                ...edgesSnapshot.filter((edge) => edge.id !== insertEdge.id),
                {
                    id: `${insertEdge.source}-${newNodeId}`,
                    source: insertEdge.source,
                    target: newNodeId,
                    type: 'actionEdge',
                },
                {
                    id: `${newNodeId}-${insertEdge.target}`,
                    source: newNodeId,
                    target: insertEdge.target,
                    type: 'actionEdge',
                },
            ]);
        }
    }, [edges, nodes, screenToFlowPosition, pendingSourceHandleId]);

    const onNodesChange = useCallback(
        (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    const onConnect = useCallback(
        (params: any) => {
            const sourceHandle = params.sourceHandle === 'add-next' ? undefined : params.sourceHandle;
            const normalizedParams = {
                ...params,
                sourceHandle,
                type: 'actionEdge',
            };

            setEdges((edgesSnapshot) => {
                const filtered = edgesSnapshot.filter(
                    (edge) => !(edge.source === params.source && edge.sourceHandle === sourceHandle)
                );
                return addEdge(normalizedParams, filtered);
            });
            setConnectingSourceNodeId(null);
            setConnectingSourceHandleId(null);
        },
        [],
    );
    const onConnectStart = useCallback((_event: any, { nodeId, handleId }: any) => {
        setConnectingSourceNodeId(nodeId ?? null);
        setConnectingSourceHandleId(handleId ?? null);
    }, []);
    const onConnectEnd = useCallback(() => {
        setConnectingSourceNodeId(null);
        setConnectingSourceHandleId(null);
    }, []);
    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);
    const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const type = event.dataTransfer.getData('application/reactflow') as NodeTypeName;

        if (!type || !(type in nodeTypes)) {
            return;
        }

        createNode(type, event.clientX, event.clientY, pendingSourceNodeId, pendingInsertEdgeId);
        setPendingSourceNodeId(null);
        setPendingSourceHandleId(null);
        setPendingInsertEdgeId(null);
        setIsSidebarOpen(false);
    }, [createNode, pendingInsertEdgeId, pendingSourceNodeId]);
    const onSidebarClick = useCallback((event: ReactMouseEvent, type: NodeTypeName) => {
        event.preventDefault();
        createNode(type, undefined, undefined, pendingSourceNodeId, pendingInsertEdgeId);
        setPendingSourceNodeId(null);
        setPendingSourceHandleId(null);
        setPendingInsertEdgeId(null);
        setIsSidebarOpen(false);
    }, [createNode, pendingInsertEdgeId, pendingSourceNodeId]);
    const closeNodePicker = useCallback(() => {
        setPendingSourceNodeId(null);
        setPendingSourceHandleId(null);
        setPendingInsertEdgeId(null);
        setIsSidebarOpen(false);
    }, []);

    const handleManualSave = async () => {
        if (!flowId) return;
        try {
            const backendNodes = nodes.map(n => ({
                id: n.id,
                type: n.type,
                label: n.data?.label || n.type,
                x: n.position.x,
                y: n.position.y,
                data: JSON.stringify({
                    alias: n.data?.alias || n.id.replace(/-/g, '_'),
                    parameters: n.data?.parameters || {},
                    output: n.data?.output || null,
                    style: n.style || undefined
                })
            }));

            const backendEdges = edges.map(e => ({
                id: e.id,
                source: e.source,
                target: e.target,
                type: e.type || null,
                sourceHandle: e.sourceHandle || null,
                targetHandle: e.targetHandle || null,
                data: e.data ? JSON.stringify(e.data) : null
            }));

            const { x: vx, y: vy, zoom: vz } = getViewport();

            // Save flow name
            await invoke("update_flow", { id: flowId, name: flowName });

            await invoke("save_flow_data", {
                flowId,
                nodes: backendNodes,
                edges: backendEdges,
                zoom: vz,
                viewportX: vx,
                viewportY: vy
            });

            toast({
                title: "Fluxo salvo!",
                description: "O fluxo foi salvo com sucesso no banco de dados.",
                variant: "success",
            });
        } catch (err) {
            console.error("Failed to save flow:", err);
            toast({
                title: "Erro ao salvar!",
                description: "Não foi possível salvar o fluxo.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Header */}
            <div className='h-18 border-b flex items-center px-4 gap-4 flex-none bg-white'>

                <div className='w-full flex flex-col items-start'>
                    <input
                        ref={inputRef}
                        disabled={!isEditingName}
                        value={flowName}
                        onChange={(e) => setFlowName(e.target.value)}
                        onBlur={() => handleFlowNameBlur(flowName)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                inputRef.current?.blur();
                            }
                        }}
                        className={`text-md font-semibold text-neutral-800 bg-transparent border rounded-md px-1.5 py-0.5 outline-none transition-all duration-150 ${
                            isEditingName 
                                ? 'border-neutral-300 bg-white ring-2 ring-teal-500/10' 
                                : 'border-transparent hover:border-neutral-200 cursor-pointer'
                        }`}
                        onClick={!isEditingName ? handleNameClick : undefined}
                    />
                    <p className='text-xs text-neutral-400 pl-1.5'>ID: {flowId || "N/A"}</p>
                </div>


                <div className='flex items-center gap-2 min-w-fit'>
                    <div>
                        {autoSaveEnabled ? (
                            <div className='flex items-center gap-2 bg-teal-50 border border-teal-100 rounded px-2.5 py-1'>
                                <div className='size-1.5 rounded-full bg-teal-600 animate-ping'></div>
                                <div className='text-[10px] uppercase font-bold text-teal-600 tracking-wider'>Auto save active</div>
                            </div>
                        ) : (
                            <div className='flex items-center gap-2 bg-neutral-100 border border-neutral-200 rounded px-2.5 py-1'>
                                <div className='size-1.5 rounded-full bg-neutral-400'></div>
                                <div className='text-[10px] uppercase font-bold text-neutral-500 tracking-wider'>Auto save inactive</div>
                            </div>
                        )}
                    </div>

                    <Separator orientation="vertical" className='h-9 my-auto mx-2' />

                    {!autoSaveEnabled && (
                        <Button variant='outline' onClick={handleManualSave} className="rounded-md">
                            Salvar
                        </Button>
                    )}

                    <Button variant='outline' onClick={() => navigate({ to: "/dashboard/flows" })} className="rounded-md">
                        Close
                    </Button>

                    <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-md">
                        <PlayIcon /> Run Flow
                    </Button>
                </div>
            </div>

            {/* ReactFlow Canvas container */}
            <div
                className='flex-1 min-h-0 relative'
                onMouseMove={(e) => {
                    mouseRef.current = { x: e.clientX, y: e.clientY };
                }}
            >
                <ContextMenu>
                    <ContextMenuTrigger className='h-full w-full block'>
                        <ReactFlow
                            nodes={renderedNodes}
                            edges={renderedEdges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            connectionLineStyle={{
                                strokeWidth: connectionStyle.strokeWidth,
                                stroke: connectionStyle.stroke,
                            }}
                            onConnectStart={onConnectStart}
                            onConnectEnd={onConnectEnd}
                            onNodeDoubleClick={onNodeDoubleClick}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            onMoveEnd={onMoveEnd}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            className="flow-canvas"
                            zoomOnScroll={!isCanvasEmpty}
                            panOnScroll={false}
                            panOnDrag={!isCanvasEmpty}
                            zoomOnPinch={!isCanvasEmpty}
                            zoomOnDoubleClick={!isCanvasEmpty}
                            panActivationKeyCode="Control"
                            selectionOnDrag={true}
                            selectionMode={SelectionMode.Partial}
                            multiSelectionKeyCode="Shift"
                            selectNodesOnDrag={false}
                            snapToGrid={true}
                            snapGrid={[20, 20]}
                            fitView
                            minZoom={zoomLimits.minZoom}
                            maxZoom={zoomLimits.maxZoom}

                        >
                            <Background bgColor='#f5f5f5' color="#b1b1b7" variant={BackgroundVariant.Dots} gap={16} />
                            <CanvasControls />
                            <MiniMap zoomable pannable position="bottom-left" style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5' }} />


                            <NodePickerSidebar
                                isOpen={isSidebarOpen}
                                searchTerm={searchTerm}
                                filteredCategories={filteredCategories}
                                onSearchChange={setSearchTerm}
                                onClose={closeNodePicker}
                                onNodeDrop={onDrop}
                                onNodeDragOver={onDragOver}
                                onNodeClick={onSidebarClick}
                            />

                            <div className='absolute top-4 right-4 z-10 flex flex-col gap-1'>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button
                                            variant='outline'
                                            className="size-8 rounded-sm"
                                            onClick={() => setIsSidebarOpen(true)}
                                        >
                                            <PlusIcon />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent align='center' side='left'>
                                        <p>Add new node</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button variant='outline' className="size-8 rounded-sm" onClick={() => setIsSearchModalOpen(true)}>
                                            <SearchIcon />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent align='center' side='left'>
                                        <p>Search a node</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button variant='outline' className="size-8 rounded-sm" onClick={addStickNote}>
                                            <StickyNotePlusIcon />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent align='center' side='left'>
                                        <p>Add a stick note</p>
                                    </TooltipContent>
                                </Tooltip>

                            </div>
                        </ReactFlow>

                        {isCanvasEmpty && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                                <div className="flex flex-col items-center pointer-events-auto bg-transparent p-6 rounded-lg">
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="w-24 h-24 bg-white border-2 border-dashed border-neutral-300 hover:border-teal-500 hover:text-teal-600 rounded-2xl flex items-center justify-center text-neutral-400 hover:scale-105 transition-all shadow-sm cursor-pointer"
                                    >
                                        <PlusIcon className="size-8" />
                                    </button>
                                    <span className="mt-3 text-sm font-semibold text-neutral-500 hover:text-teal-600 cursor-pointer" onClick={() => setIsSidebarOpen(true)}>
                                        Add trigger step
                                    </span>
                                </div>
                            </div>
                        )}


                        <NodeEditorModal
                            open={editingNode !== null && editingNode.type !== 'stickNote'}
                            onOpenChange={(open) => !open && setEditingNode(null)}
                            node={editingNode}
                            allNodes={nodes}
                            allEdges={edges}
                            onSave={handleSaveNodeDetails}
                        />

                        <StickyNoteEditorModal
                            open={editingNode !== null && editingNode.type === 'stickNote'}
                            onOpenChange={(open) => !open && setEditingNode(null)}
                            node={editingNode}
                            onSave={(nodeId, label, description) => {
                                setNodes(prev => prev.map(n => {
                                    if (n.id === nodeId) {
                                        return {
                                            ...n,
                                            data: {
                                                ...n.data,
                                                label,
                                                description
                                            }
                                        };
                                    }
                                    return n;
                                }));
                                setEditingNode(null);
                            }}
                        />

                        <Dialog open={isSearchModalOpen} onOpenChange={(open) => {
                            setIsSearchModalOpen(open);
                            if (!open) setSearchQuery('');
                        }}>
                            <DialogContent className="max-w-[450px]">
                                <DialogHeader>
                                    <DialogTitle>Buscar Node</DialogTitle>
                                </DialogHeader>
                                <div className="py-4 flex flex-col gap-4">
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100"
                                        placeholder="Digite para buscar pelo nome ou tipo..."
                                        autoFocus
                                    />
                                    
                                    <div className="max-h-60 overflow-y-auto border border-neutral-100 rounded-md divide-y divide-neutral-100 bg-neutral-50/50">
                                        {matchingNodes.length === 0 ? (
                                            <p className="text-xs text-neutral-400 italic p-4 text-center">
                                                {searchQuery.trim() ? "Nenhum node encontrado" : "Digite um termo para começar a busca"}
                                            </p>
                                        ) : (
                                            matchingNodes.map((n) => {
                                                const label = n.data?.label || n.type || 'Node';
                                                return (
                                                    <button
                                                        key={n.id}
                                                        type="button"
                                                        onClick={() => handleSelectSearchedNode(n.id)}
                                                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 transition flex items-center justify-between text-sm cursor-pointer"
                                                    >
                                                        <span className="font-medium text-neutral-700">{label}</span>
                                                        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider bg-neutral-100 px-1.5 py-0.5 rounded">
                                                            {n.type}
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => {
                                        setIsSearchModalOpen(false);
                                        setSearchQuery('');
                                    }}>
                                        Fechar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>


                        <Dialog open={renamingNode !== null} onOpenChange={(open) => !open && setRenamingNode(null)}>
                            <DialogContent className="max-w-[400px]">
                                <DialogHeader>
                                    <DialogTitle>Renomear Node</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <input
                                        value={renameInputValue}
                                        onChange={(e) => setRenameInputValue(e.target.value)}
                                        className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100"
                                        placeholder="Nome do node"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSaveRename();
                                            }
                                        }}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setRenamingNode(null)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleSaveRename} className="bg-teal-600 hover:bg-teal-700 text-white">
                                        Salvar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </ContextMenuTrigger>

                    <ContextMenuContent className="w-56">
                        <ContextMenuItem disabled={!clipboardNode} onSelect={() => pasteNode()} onClick={() => pasteNode()}>
                            Paste
                            <ContextMenuShortcut>Ctrl + V</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem onSelect={selectAll} onClick={selectAll}>
                            Select All
                            <ContextMenuShortcut>Ctrl + A</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem onSelect={clearSelection} onClick={clearSelection}>
                            Clear Selection
                            <ContextMenuShortcut>Esc</ContextMenuShortcut>
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            </div>
        </div>
    );
}

function CanvasControls() {
    const { fitView, zoomIn, zoomOut, zoomTo } = useReactFlow();
    const { zoom } = useViewport();

    return (
        <div className='absolute bottom-4 right-4 z-10 flex items-center gap-1 rounded-md border bg-white p-1 shadow-sm'>
            <Tooltip>
                <TooltipTrigger>
                    <Button
                        variant='ghost'
                        className='size-8 rounded-sm'
                        onClick={() => zoomOut({ duration: 180 })}
                    >
                        <MinusIcon />
                    </Button>
                </TooltipTrigger>
                <TooltipContent align='center' side='top'>
                    <p>Zoom out</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger>
                    <Button
                        variant='ghost'
                        className='size-8 rounded-sm'
                        onClick={() => zoomTo(1, { duration: 180 })}
                    >
                        <span className='text-[11px] font-semibold'>{Math.round(zoom * 100)}%</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent align='center' side='top'>
                    <p>Zoom 100%</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger>
                    <Button
                        variant='ghost'
                        className='size-8 rounded-sm'
                        onClick={() => zoomIn({ duration: 180 })}
                    >
                        <ZoomInIcon />
                    </Button>
                </TooltipTrigger>
                <TooltipContent align='center' side='top'>
                    <p>Zoom in</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger>
                    <Button
                        variant='ghost'
                        className='size-8 rounded-sm'
                        onClick={() => fitView({ duration: 220 })}
                    >
                        <Maximize2Icon />
                    </Button>
                </TooltipTrigger>
                <TooltipContent align='center' side='top'>
                    <p>Fit view</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

type NodePickerSidebarProps = {
    isOpen: boolean;
    searchTerm: string;
    filteredCategories: NodeCategory[];
    onSearchChange: (value: string) => void;
    onClose: () => void;
    onNodeDrop: (event: DragEvent<HTMLDivElement>) => void;
    onNodeDragOver: (event: DragEvent<HTMLDivElement>) => void;
    onNodeClick: (event: ReactMouseEvent, type: NodeTypeName) => void;
};

function NodePickerSidebar({
    isOpen,
    searchTerm,
    filteredCategories,
    onSearchChange,
    onClose,
    onNodeDrop,
    onNodeDragOver,
    onNodeClick,
}: NodePickerSidebarProps) {
    return (
        <div className={`absolute inset-0 z-20 pointer-events-none ${isOpen ? '' : 'delay-200'}`}>
            <div
                aria-label="Close node sidebar"
                className={`absolute inset-0 bg-transparent transition-opacity duration-200 ${isOpen ? 'pointer-events-auto opacity-100' : 'opacity-0'}`}
                onClick={onClose}
                onDragOver={onNodeDragOver}
                onDrop={onNodeDrop}
            />

            <aside
                className={`absolute right-0 top-0 h-full w-[430px] max-w-[calc(100vw-28px)] bg-white border-l shadow-xl pointer-events-auto transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className='h-16 border-b px-4 flex items-center'>
                    <h2 className='text-lg font-semibold text-neutral-900'>What happens next?</h2>
                </div>

                <div className='h-[calc(100%-4rem)] overflow-y-auto px-4 py-3'>
                    <label className='relative block'>
                        <SearchIcon className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400' />
                        <input
                            value={searchTerm}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder='Search nodes...'
                            className='h-10 w-full rounded-md border border-neutral-200 bg-white pl-9 pr-4 text-sm outline-none shadow-sm transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100'
                        />
                    </label>

                    <div className='mt-4'>
                        <Accordion
                            multiple
                            defaultValue={filteredCategories.map((category) => category.title)}
                            className='space-y-0'
                        >
                            {filteredCategories.map((category) => (
                                <AccordionItem
                                    key={category.title}
                                    value={category.title}
                                    className="border-b border-neutral-200 rounded-none shadow-none bg-transparent"
                                >
                                    <AccordionTrigger className='px-0 py-2.5 hover:no-underline'>
                                        <CategoryHeader category={category} />
                                    </AccordionTrigger>

                                    <AccordionContent className='px-0 pb-3'>
                                        <div className='space-y-1'>
                                            {category.nodes.map((node) => (
                                                <NodePickerItem
                                                    key={node.type}
                                                    item={node}
                                                    colorClassName={category.colorClassName}
                                                    onNodeClick={onNodeClick}
                                                />
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        {filteredCategories.length === 0 && (
                            <div className='py-10 text-center text-sm text-neutral-500'>
                                No nodes found.
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
}

function CategoryHeader({ category }: { category: NodeCategory }) {
    const Icon = category.icon;

    return (
        <div className='grid flex-1 grid-cols-[24px_1fr] items-center gap-2'>
            <Icon className={`size-5 justify-self-center ${category.colorClassName}`} />
            <div>
                <div className='text-sm font-semibold leading-tight text-neutral-900'>{category.title}</div>
                <p className='mt-0.5 text-xs leading-snug text-neutral-500'>{category.description}</p>
            </div>
        </div>
    );
}

function NodePickerItem({
    item,
    colorClassName,
    onNodeClick,
}: {
    item: NodeCatalogItem;
    colorClassName: string;
    onNodeClick: (event: ReactMouseEvent, type: NodeTypeName) => void;
}) {
    const Icon = item.icon;

    return (
        <button
            className='grid w-full cursor-grab grid-cols-[24px_1fr] items-center gap-2 rounded-md px-1 py-1.5 text-left transition hover:bg-neutral-50 active:cursor-grabbing'
            draggable
            onClick={(event) => onNodeClick(event, item.type)}
            onDragStart={(event) => {
                event.dataTransfer.setData('application/reactflow', item.type);
                event.dataTransfer.setData('text/plain', item.type);
                event.dataTransfer.effectAllowed = 'move';
            }}
            type='button'
        >
            <Icon className={`size-5 justify-self-center ${colorClassName}`} />
            <span>
                <span className='block text-sm font-semibold leading-tight text-neutral-900'>{item.label}</span>
                <span className='mt-0.5 block text-xs leading-snug text-neutral-500'>{item.description}</span>
            </span>
        </button>
    );
}
