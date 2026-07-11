import { Position } from '@xyflow/react';
import type { ComponentType, MouseEvent as ReactMouseEvent } from 'react';
import { PlusIcon } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import CustomInputHandle from '../handles/input-handle';
import CustomOutputHandle from '../handles/output-handle';

type WorkflowNodeProps = {
    id?: string;
    selected?: boolean;
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
    selected,
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
            <Card className={`rounded-2xl w-24 h-24 overflow-visible transition-all duration-150 ${selected ? 'ring-4 ring-teal-400/20 border-neutral-500 shadow-md z-10' : 'border-neutral-300'}`}>
                <CardContent className='flex items-center justify-center w-full h-full gap-2'>
                    {input && (
                        <CustomInputHandle
                            type="target"
                            position={Position.Left}
                            id="a"
                            isConnectable={true}
                        />
                    )}

                    <Icon className={`size-8 ${iconClassName}`} />

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
                    <div className='group relative size-5'>
                        <button
                            className='!pointer-events-auto -left-2.5 !top-3 !m-0 !flex !size-5 !translate-x-0 !translate-y-0 !items-center !justify-center !rounded-sm !border-0 !bg-neutral-200 hover:bg-teal-100 transition hover:!bg-neutral-300'
                            onClick={(event: ReactMouseEvent) => {
                                event.stopPropagation();
                                data?.onAddNext?.(id);
                            }}
                        />
                        <PlusIcon className='pointer-events-none absolute left-2.5 top-2.5 z-30 size-3 -translate-x-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-teal-600 group-hover:bg-teal-100 transition group-hover:!bg-neutral-300 group-hover:!text-neutral-800' />
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkflowNode;
