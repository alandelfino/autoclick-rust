import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { Button } from '../../components/ui/button'
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, MarkerType, ReactFlow, ReactFlowProvider, SelectionMode, useReactFlow, useViewport } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Separator } from '../../components/ui/separator'
import { NodeEditorModal } from './-components/node-editor-modal'
import { useToast } from '../../hooks/use-toast'
import {
    ArrowBigDownDash,
    BadgeCheckIcon,
    BriefcaseBusinessIcon,
    CloudCogIcon,
    DatabaseBackupIcon,
    DatabaseIcon,
    DatabaseZapIcon,
    Edit3Icon,
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
    Trash2Icon,
    TriangleAlertIcon,
    TypeIcon,
    VariableIcon,
    ZoomInIcon,
} from 'lucide-react'
import type { ComponentType, DragEvent, MouseEvent as ReactMouseEvent } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '../../components/ui/context-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip'
import startNode from './-components/nodes/start-node'
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
import actionEdge from './-components/action-edge'
import logo from '../../assets/logo.png'

type FlowSearch = {
    id?: string;
}

export const Route = createFileRoute('/flow/')({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): FlowSearch => {
        return {
            id: search.id as string | undefined,
        }
    }
})

const nodeTypes = {
    startNode,
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
            { type: 'startNode', label: 'Start', description: 'Start your flow', category: 'Core', icon: PlayIcon },
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

const initialNodes = [
    { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Start' }, type: 'startNode' },
    { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Click by coordinates' }, type: 'clickByCoordinatesNode' },
    { id: 'n3', position: { x: 0, y: 200 }, data: { label: 'Move cursor' }, type: 'moveCursorNode' },
    { id: 'n4', position: { x: 0, y: 300 }, data: { label: 'Key press' }, type: 'keypressNode' },
    { id: 'n5', position: { x: 0, y: 400 }, data: { label: 'Type text' }, type: 'typeTextNode' },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2', type: 'actionEdge' }];

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
    const [pendingInsertEdgeId, setPendingInsertEdgeId] = useState<string | null>(null);
    const [connectingSourceNodeId, setConnectingSourceNodeId] = useState<string | null>(null);
    const { screenToFlowPosition, setViewport, getViewport } = useReactFlow();

    const [flowName, setFlowName] = useState("Carregando fluxo...");
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
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
                    setNodes(initialNodes);
                    setEdges(initialEdges);
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
                setNodes(initialNodes);
                setEdges(initialEdges);
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
                        output: n.data?.output || null
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

    const openNodePickerFromNode = useCallback((sourceNodeId: string) => {
        setPendingSourceNodeId(sourceNodeId);
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

    const renderedNodes = useMemo(() => {
        return nodes.map((node) => ({
            ...node,
            data: {
                ...node.data,
                hasOutgoingConnection: edges.some((edge) => edge.source === node.id),
                connectingSourceNodeId,
                onAddNext: openNodePickerFromNode,
            },
        }));
    }, [connectingSourceNodeId, edges, nodes, openNodePickerFromNode]);

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
            setEdges((edgesSnapshot) => addEdge({
                id: `${sourceNodeId}-${newNodeId}`,
                source: sourceNodeId,
                target: newNodeId,
                type: 'actionEdge',
            }, edgesSnapshot));
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
    }, [edges, nodes, screenToFlowPosition]);

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
            const normalizedParams = {
                ...params,
                sourceHandle: params.sourceHandle === 'add-next' ? undefined : params.sourceHandle,
                type: 'actionEdge',
            };

            setEdges((edgesSnapshot) => addEdge(normalizedParams, edgesSnapshot));
            setConnectingSourceNodeId(null);
        },
        [],
    );
    const onConnectStart = useCallback((_event: any, params: any) => {
        if (params?.handleId === 'add-next') {
            setConnectingSourceNodeId(params.nodeId ?? null);
        }
    }, []);
    const onConnectEnd = useCallback(() => {
        setConnectingSourceNodeId(null);
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
        setPendingInsertEdgeId(null);
        setIsSidebarOpen(false);
    }, [createNode, pendingInsertEdgeId, pendingSourceNodeId]);
    const onSidebarClick = useCallback((event: ReactMouseEvent, type: NodeTypeName) => {
        event.preventDefault();
        createNode(type, undefined, undefined, pendingSourceNodeId, pendingInsertEdgeId);
        setPendingSourceNodeId(null);
        setPendingInsertEdgeId(null);
        setIsSidebarOpen(false);
    }, [createNode, pendingInsertEdgeId, pendingSourceNodeId]);
    const closeNodePicker = useCallback(() => {
        setPendingSourceNodeId(null);
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
                    output: n.data?.output || null
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
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            {/* Header */}
            <div className='h-18 border-b flex items-center px-4 gap-4 flex-none bg-white'>
                <div>
                    <img
                        src={logo}
                        alt='Logo'
                        className='h-18 object-contain'
                    />
                </div>

                <Separator orientation="vertical" className='h-9 my-auto' />

                <div className='w-full'>
                    <span className='text-md font-semibold text-neutral-800'>{flowName}</span>
                    <p className='text-xs text-neutral-400'>ID: {flowId || "N/A"}</p>
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
            <div className='flex-1 min-h-0 relative'>
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
                            zoomOnScroll={true}
                            panOnScroll={false}
                            panOnDrag={true}
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
                                        <Button variant='outline' className="size-8 rounded-sm">
                                            <SearchIcon />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent align='center' side='left'>
                                        <p>Search a node</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button variant='outline' className="size-8 rounded-sm">
                                            <StickyNotePlusIcon />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent align='center' side='left'>
                                        <p>Add a stick note</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </ReactFlow>

                        <NodeEditorModal
                            open={editingNode !== null}
                            onOpenChange={(open) => !open && setEditingNode(null)}
                            node={editingNode}
                            allNodes={nodes}
                            allEdges={edges}
                            onSave={handleSaveNodeDetails}
                        />
                    </ContextMenuTrigger>

                    <ContextMenuContent>
                        <ContextMenuItem>
                            <Edit3Icon />
                            Editar
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem variant='destructive'>
                            <Trash2Icon />
                            Excluir
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
                <div className='h-28 border-b px-7 flex items-center'>
                    <h2 className='text-xl font-semibold text-neutral-900'>What happens next?</h2>
                </div>

                <div className='h-[calc(100%-7rem)] overflow-y-auto px-7 py-5'>
                    <label className='relative block'>
                        <SearchIcon className='absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-400' />
                        <input
                            value={searchTerm}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder='Search nodes...'
                            className='h-14 w-full rounded-md border border-neutral-200 bg-white pl-12 pr-4 text-base outline-none shadow-sm transition focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100'
                        />
                    </label>

                    <div className='mt-8'>
                        <Accordion
                            multiple
                            defaultValue={filteredCategories.map((category) => category.title)}
                            className='space-y-3'
                        >
                            {filteredCategories.map((category) => (
                                <AccordionItem
                                    key={category.title}
                                    value={category.title}
                                    className={`rounded-md border ${category.accentClassName}`}
                                >
                                    <AccordionTrigger className='px-4 py-4 hover:no-underline'>
                                        <CategoryHeader category={category} />
                                    </AccordionTrigger>

                                    <AccordionContent className='px-4'>
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
        <div className='grid flex-1 grid-cols-[36px_1fr] items-center gap-3'>
            <Icon className={`size-5 justify-self-center ${category.colorClassName}`} />
            <div>
                <div className='text-sm font-semibold leading-tight text-neutral-900'>{category.title}</div>
                <p className='mt-1 text-sm leading-snug text-neutral-500'>{category.description}</p>
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
            className='grid w-full cursor-grab grid-cols-[36px_1fr] items-center gap-3 rounded-md px-0 py-2 text-left transition hover:bg-white/70 active:cursor-grabbing'
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
