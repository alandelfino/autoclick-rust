import { createFileRoute } from '@tanstack/react-router'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'
import { Button } from '../../components/ui/button'
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, PanOnScrollMode, ReactFlow, ReactFlowProvider, SelectionMode, useReactFlow, useViewport } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Separator } from '../../components/ui/separator'
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
    SaveIcon,
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
import startNode from './-components/start-node'
import clickByCoordinatesNode from './-components/click-by-coordinates-node'
import moveCursorNode from './-components/move-cursor-node'
import keypressNode from './-components/keypress-node'
import typeTextNode from './-components/type-text-node'
import windowsDataNode from './-components/windows-data-node'
import conditionalNode from './-components/conditional-node'
import delayNode from './-components/delay-node'
import loopNode from './-components/loop-node'
import nextItemNode from './-components/next-item-node'
import stopLoopNode from './-components/stop-loop-node'
import switchCaseNode from './-components/switch-case-node'
import postgresqlQueryNode from './-components/postgresql-query-node'
import mysqlQueryNode from './-components/mysql-query-node'
import sqliteQueryNode from './-components/sqlite-query-node'
import apiRequestNode from './-components/api-request-node'
import variableNode from './-components/variable-node'
import runJavascriptNode from './-components/run-javascript-node'
import actionsDialogNode from './-components/actions-dialog-node'
import alertDialogNode from './-components/alert-dialog-node'
import actionEdge from './-components/action-edge'
import logo from '../../assets/logo.png'

export const Route = createFileRoute('/flow/')({
    component: RouteComponent,
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
    return (
        <>
            <div className='h-16 border-y flex items-center px-4 gap-4'>
                <div>
                    <img
                        src={logo}
                        alt='Logo'
                        className='h-11 object-contain'
                    />
                </div>

                <Separator orientation="vertical" className='h-9 my-auto' />

                <Breadcrumb className='w-full'>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink render={<a href="#">Flows</a>} className='text-xs font-semibold text-neutral-800' />
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className='text-xs'>#123456789</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className='flex items-center gap-2 min-w-fit'>
                    <div>
                        <div className='flex items-center gap-2'>
                            <div className='size-1 rounded-full bg-teal-600 animate-ping leading-1'></div>
                            <div className='text-xs text-teal-600 leading-1'>Auto save active</div>
                        </div>
                        <span className='text-xs min-w-fit'>Last save change: 21/07/2026 13:23</span>
                    </div>

                    <Separator orientation="vertical" className='h-9 my-auto mx-4' />

                    <Button variant='outline'>
                        Close
                    </Button>

                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                        <SaveIcon /> Save
                    </Button>
                </div>
            </div>

            <div className='w-screen h-[calc(100vh-3.5rem)]'>
                <ReactFlowProvider>
                    <FlowBuilder />
                </ReactFlowProvider>
            </div>
        </>
    )
}

function FlowBuilder() {
    const [nodes, setNodes] = useState<any[]>(initialNodes);
    const [edges, setEdges] = useState<any[]>(initialEdges);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingSourceNodeId, setPendingSourceNodeId] = useState<string | null>(null);
    const [pendingInsertEdgeId, setPendingInsertEdgeId] = useState<string | null>(null);
    const [connectingSourceNodeId, setConnectingSourceNodeId] = useState<string | null>(null);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const { screenToFlowPosition } = useReactFlow();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Control') {
                setIsCtrlPressed(true);
            }
        };
        const onKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'Control') {
                setIsCtrlPressed(false);
            }
        };
        const onBlur = () => setIsCtrlPressed(false);

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
        };
    }, []);

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
            data: {
                ...edge.data,
                onDeleteEdge: deleteEdge,
                onInsertNode: openNodePickerFromEdge,
            },
        }));
    }, [deleteEdge, edges, openNodePickerFromEdge]);

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

    return (
        <ContextMenu>
            <ContextMenuTrigger className='h-full w-full'>
                <ReactFlow
            nodes={renderedNodes}
            edges={renderedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            className={isCtrlPressed ? 'flow-canvas flow-canvas--ctrl' : 'flow-canvas'}
            zoomOnScroll={false}
            zoomActivationKeyCode="Control"
            panOnScroll={true}
            panOnScrollMode={PanOnScrollMode.Vertical}
            panOnDrag={false}
            panActivationKeyCode="Control"
            selectionOnDrag={true}
            selectionMode={SelectionMode.Partial}
            multiSelectionKeyCode="Shift"
            selectNodesOnDrag={false}
            snapToGrid={true}
            snapGrid={[20, 20]}
            fitView
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

            <div className='absolute top-4 right-4 z-10 flex flex-col gap-2'>
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            variant='outline'
                            className="size-8 shadow-sm rounded-md"
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
                        <Button variant='outline' className="size-8 shadow-sm rounded-md">
                            <SearchIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent align='center' side='left'>
                        <p>Search a node</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger>
                        <Button variant='outline' className="size-8 shadow-sm rounded-md">
                            <StickyNotePlusIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent align='center' side='left'>
                        <p>Add a stick note</p>
                    </TooltipContent>
                </Tooltip>
            </div>
                </ReactFlow>
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
