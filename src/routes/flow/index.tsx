import { createFileRoute } from '@tanstack/react-router'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb'
import { Button } from '../../components/ui/button'
import { addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Controls, ReactFlow, ReactFlowProvider } from '@xyflow/react'
import { useCallback, useState } from 'react'
import { Separator } from '../../components/ui/separator'
import { PlusIcon, SaveIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip'
import startNode from './-components/start-node'


export const Route = createFileRoute('/flow/')({
    component: RouteComponent,
})

const nodeTypes = {
    startNode: startNode,
};

const initialNodes = [
    { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' }, type: 'startNode' },
    { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

function RouteComponent() {

    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback(
        (changes: any) => setNodes((nodesSnapshot: any) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: any) => setEdges((edgesSnapshot: any) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    const onConnect = useCallback(
        (params: any) => setEdges((edgesSnapshot: any) => addEdge(params, edgesSnapshot)),
        [],
    );



    return <>

        {/* Header */}
        <div className='h-16 border-y flex items-center px-4 gap-4'>

            {/* Logo */}
            <div>
                <img
                    src='/src/assets/logo.png'
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

                <Button variant='outline' className=''>
                    Close
                </Button>

                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                    <SaveIcon /> Save
                </Button>
            </div>
        </div>

        {/* Page Content */}
        <div className='w-screen h-[calc(100vh-3.5rem)]'>
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background color="#ccc" variant={BackgroundVariant.Dots} />
                    <Controls position='bottom-right' orientation='horizontal' showFitView={true} showZoom={true} showInteractive={true} />

                    <div className='absolute top-4 right-4 z-10'>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant='outline' className="size-12 shadow-sm rounded-md">
                                    <PlusIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent align='center' side='left'>
                                <p>Add new node</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                </ReactFlow>
            </ReactFlowProvider>

        </div>


    </>
}
