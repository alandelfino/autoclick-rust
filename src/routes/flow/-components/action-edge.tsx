import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { memo, useRef, useState } from 'react';

type ActionEdgeData = {
    onDeleteEdge?: (edgeId: string) => void;
    onInsertNode?: (edgeId: string) => void;
};

const ActionEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style,
    data,
}: EdgeProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const hideTimeoutRef = useRef<number | null>(null);
    const edgeData = data as ActionEdgeData | undefined;
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <g
                onMouseEnter={() => {
                    if (hideTimeoutRef.current) {
                        window.clearTimeout(hideTimeoutRef.current);
                    }
                    setIsHovered(true);
                }}
                onMouseLeave={() => {
                    hideTimeoutRef.current = window.setTimeout(() => setIsHovered(false), 180);
                }}
            >
                <BaseEdge
                    path={edgePath}
                    markerEnd={markerEnd}
                    style={style}
                    interactionWidth={28}
                />
            </g>

            <EdgeLabelRenderer>
                <div
                    className={`nodrag nopan absolute flex items-center justify-center gap-[2px] transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: isHovered ? 'all' : 'none',
                    }}
                    onMouseEnter={() => {
                        if (hideTimeoutRef.current) {
                            window.clearTimeout(hideTimeoutRef.current);
                        }
                        setIsHovered(true);
                    }}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <button
                        type='button'
                        className='flex size-5 items-center justify-center rounded-xs border bg-white text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-800 hover:border-neutral-600'
                        onClick={(event) => {
                            event.stopPropagation();
                            edgeData?.onInsertNode?.(id);
                        }}
                    >
                        <PlusIcon className='size-3' />
                    </button>
                    <button
                        type='button'
                        className='flex size-5 items-center justify-center rounded-xs border bg-white text-neutral-400 transition hover:bg-red-50 hover:text-red-600 hover:border-red-600'
                        onClick={(event) => {
                            event.stopPropagation();
                            edgeData?.onDeleteEdge?.(id);
                        }}
                    >
                        <Trash2Icon className='size-3' />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default memo(ActionEdge);
