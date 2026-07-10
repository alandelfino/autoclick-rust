import { Position } from '@xyflow/react';
import type { ComponentType, MouseEvent as ReactMouseEvent } from 'react';
import { PlusIcon } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import CustomInputHandle from './input-handle';
import CustomOutputHandle from './output-handle';

type WorkflowNodeProps = {
    id?: string;
    data?: {
        hasOutgoingConnection?: boolean;
        connectingSourceNodeId?: string | null;
        onAddNext?: (sourceNodeId: string) => void;
    };
    icon: ComponentType<{ className?: string }>;
    iconClassName: string;
    label: string;
    input?: boolean;
    output?: boolean;
};

const WorkflowNode = ({
    id,
    data,
    icon: Icon,
    iconClassName,
    label,
    input = true,
    output = true,
}: WorkflowNodeProps) => {
    const showAddNextPointer = output && id && !data?.hasOutgoingConnection;
    const isConnectingFromPointer = showAddNextPointer && data?.connectingSourceNodeId === id;

    return (
        <div className='relative w-24 h-24'>
            <Card className='rounded-2xl w-24 h-24 border-neutral-300 overflow-visible'>
                <CardContent className='flex items-center justify-center w-full h-full gap-2'>
                    {input && (
                        <CustomInputHandle
                            type="target"
                            position={Position.Left}
                            id="a"
                            isConnectable={true}
                        />
                    )}

                    <Icon className={`size-10 ${iconClassName}`} />

                    {output && (
                        <CustomOutputHandle
                            type="source"
                            position={Position.Right}
                            id="b"
                            isConnectable={true}
                        />
                    )}

                    <span className='text-xs leading-tight text-neutral-400 absolute top-26 left-0 w-full max-w-28 flex justify-center text-center'>
                        {label}
                    </span>
                </CardContent>
            </Card>

            {showAddNextPointer && (
                <div className={`nodrag nopan pointer-events-none absolute left-full top-1/2 z-20 flex -translate-y-1/2 items-center pl-3 transition-opacity duration-200 ${isConnectingFromPointer ? 'opacity-0' : 'opacity-100'}`}>
                    <div className='pointer-events-none h-px w-10 bg-neutral-300' />
                    <div className='relative size-6'>
                        <CustomOutputHandle
                            type="source"
                            position={Position.Right}
                            id="add-next"
                            isConnectable={true}
                            className='!pointer-events-auto !left-0 !top-0 !m-0 !flex !size-6 !translate-x-0 !translate-y-0 !items-center !justify-center !rounded-md !border-0 !bg-neutral-200 !text-neutral-700 !transition hover:!bg-neutral-300 hover:!text-neutral-950'
                            onClick={(event: ReactMouseEvent) => {
                                event.stopPropagation();
                                data?.onAddNext?.(id);
                            }}
                        />
                        <PlusIcon className='pointer-events-none absolute left-1/2 top-1/2 z-30 size-4 -translate-x-1/2 -translate-y-1/2 text-neutral-700' />
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkflowNode;
