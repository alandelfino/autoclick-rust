import { Position } from '@xyflow/react'; // Nota: A partir da v12, o pacote mudou para @xyflow/react
import { memo, type MouseEvent as ReactMouseEvent } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { PlayIcon, PlusIcon } from 'lucide-react';
import CustomOutputHandle from '../handles/output-handle';

const startNode = ({ id, data, selected }: { id?: string, selected?: boolean, data?: { hasOutgoingConnection?: boolean, connectingSourceNodeId?: string | null, onAddNext?: (sourceNodeId: string) => void } }) => {
    const showAddNextPointer = id && !data?.hasOutgoingConnection;
    const isConnectingFromPointer = showAddNextPointer && data?.connectingSourceNodeId === id;

    return (
        <div className='relative w-24 h-24'>
            <Card className={`rounded-2xl rounded-l-[100%] w-24 h-24 overflow-visible transition-all duration-150 ${selected ? 'ring-4 ring-sky-200 border-sky-500 shadow-md scale-105 z-10' : 'border-neutral-300'}`}>
                <CardContent className='flex items-center justify-center w-full h-full gap-2'>
                    <PlayIcon className='size-10 text-green-600' />

                    {/* Handler */}
                    <CustomOutputHandle
                        type="source"
                        position={Position.Right}
                        id="a"
                        isConnectable={true}
                    />

                    <span className='text-xs text-neutral-400 absolute top-26 left-0 w-full max-w-24 flex justify-center text-center'>Start you flow</span>
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
                            className='!pointer-events-auto !left-0 !top-0 !m-0 !flex !size-6 !translate-x-0 !translate-y-0 !items-center !justify-center !rounded-md !border !border-neutral-200 !bg-neutral-100 !text-neutral-700 !shadow-sm !transition hover:!bg-white hover:!text-neutral-950'
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

// Memoizar o componente evita renderizações desnecessárias e melhora a performance
export default memo(startNode);
