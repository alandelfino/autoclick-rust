import { Position } from '@xyflow/react';
import { memo, type ComponentType, type MouseEvent as ReactMouseEvent } from 'react';
import { Card, CardContent } from '../../../../../components/ui/card';
import { PlusIcon, Play, Pencil, MoreVertical } from 'lucide-react';
import CustomOutputHandle from '../handles/output-handle';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
    ContextMenuShortcut,
} from '../../../../../components/ui/context-menu';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuShortcut,
} from '../../../../../components/ui/dropdown-menu';

type TriggerNodeProps = {
    id?: string;
    selected?: boolean;
    data?: {
        label?: string;
        hasMultipleSelection?: boolean;
        selectedCount?: number;
        hasOutgoingConnection?: boolean;
        connectingSourceNodeId?: string | null;
        onAddNext?: (sourceNodeId: string) => void;
        clipboardNodeExists?: boolean;
        onSelect?: () => void;
        onOpen?: () => void;
        onExecuteStep?: () => void;
        onRename?: () => void;
        onCopy?: () => void;
        onDuplicate?: () => void;
        onPasteBefore?: () => void;
        onPasteAfter?: () => void;
        onSelectAll?: () => void;
        onClearSelection?: () => void;
        onDelete?: () => void;
    };
    icon: ComponentType<{ className?: string }>;
    iconClassName?: string;
    label: string;
};

const TriggerNode = ({
    id,
    selected,
    data,
    icon: Icon,
    iconClassName,
    label,
}: TriggerNodeProps) => {
    const showAddNextPointer = id && !data?.hasOutgoingConnection;
    const isConnectingFromPointer = showAddNextPointer && data?.connectingSourceNodeId === id;

    return (
        <div className='relative w-24 h-24 group'>
            {/* Hover Toolbar */}
            <div className='nodrag nopan absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white border border-neutral-200 rounded-md shadow-sm px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-30 before:absolute before:top-full before:left-0 before:right-0 before:h-2 before:bg-transparent'>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        data?.onExecuteStep?.();
                    }}
                    title="Execute step"
                    className="size-6 flex items-center justify-center rounded-sm hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
                >
                    <Play className="size-3.5 fill-current" />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        data?.onOpen?.();
                    }}
                    title="Edit details"
                    className="size-6 flex items-center justify-center rounded-sm hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
                >
                    <Pencil className="size-3.5" />
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                title="More actions"
                                className="size-6 flex items-center justify-center rounded-sm hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
                            >
                                <MoreVertical className="size-3.5" />
                            </button>
                        }
                    />
                    <DropdownMenuContent className="w-56" align="center" side="top" sideOffset={8}>
                        <DropdownMenuItem onSelect={data?.onOpen} onClick={data?.onOpen}>
                            Open
                            <DropdownMenuShortcut>Enter</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={data?.onExecuteStep} onClick={data?.onExecuteStep}>
                            Execute step
                            <DropdownMenuShortcut>Ctrl + R</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={data?.onRename} onClick={data?.onRename}>
                            Rename
                            <DropdownMenuShortcut>Space</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={data?.onCopy} onClick={data?.onCopy}>
                            Copy
                            <DropdownMenuShortcut>Ctrl + c</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={data?.onDuplicate} onClick={data?.onDuplicate}>
                            Duplicate
                            <DropdownMenuShortcut>Ctrl + d</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={true} onSelect={data?.onPasteBefore} onClick={data?.onPasteBefore}>
                            Paste before
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={!data?.clipboardNodeExists} onSelect={data?.onPasteAfter} onClick={data?.onPasteAfter}>
                            Paste after
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={data?.onSelectAll} onClick={data?.onSelectAll}>
                            Select All
                            <DropdownMenuShortcut>Ctrl + A</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={data?.onClearSelection} onClick={data?.onClearSelection}>
                            Clear Selection
                            <DropdownMenuShortcut>Esc</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={data?.onDelete} onClick={data?.onDelete}>
                            Delete
                            <DropdownMenuShortcut>Del</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ContextMenu>
                <ContextMenuTrigger
                    onContextMenu={() => {
                        if (!selected && data?.onSelect) {
                            data.onSelect();
                        }
                    }}
                >
                    <Card className={`rounded-2xl rounded-l-[100%] w-24 h-24 overflow-visible transition-all duration-150 ${selected ? 'ring-4 ring-teal-400/20 border-neutral-500 shadow-md z-10' : 'border-neutral-300'}`}>
                        <CardContent className='flex items-center justify-center w-full h-full gap-2'>
                            <Icon className={`size-10 ${iconClassName || ''}`} />

                            {/* Handler */}
                            <CustomOutputHandle
                                type="source"
                                position={Position.Right}
                                id="a"
                                isConnectable={true}
                            />

                            <span className='text-xs leading-tight text-neutral-400 absolute top-26 left-0 w-full max-w-24 flex justify-center text-center'>
                                {data?.label || label}
                            </span>
                        </CardContent>
                    </Card>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-56">
                    <ContextMenuItem disabled={data?.hasMultipleSelection} onSelect={data?.onOpen} onClick={data?.onOpen}>
                        Open
                        <ContextMenuShortcut>Enter</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem disabled={data?.hasMultipleSelection} onSelect={data?.onExecuteStep} onClick={data?.onExecuteStep}>
                        Execute step
                        <ContextMenuShortcut>Ctrl + R</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem disabled={data?.hasMultipleSelection} onSelect={data?.onRename} onClick={data?.onRename}>
                        Rename
                        <ContextMenuShortcut>Space</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={data?.onCopy} onClick={data?.onCopy}>
                        {data?.hasMultipleSelection ? "Copy selection" : "Copy"}
                        <ContextMenuShortcut>Ctrl + c</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={data?.onDuplicate} onClick={data?.onDuplicate}>
                        {data?.hasMultipleSelection ? "Duplicate selection" : "Duplicate"}
                        <ContextMenuShortcut>Ctrl + d</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem disabled={true} onSelect={data?.onPasteBefore} onClick={data?.onPasteBefore}>
                        Paste before
                    </ContextMenuItem>
                    <ContextMenuItem disabled={!data?.clipboardNodeExists} onSelect={data?.onPasteAfter} onClick={data?.onPasteAfter}>
                        Paste after
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onSelect={data?.onSelectAll} onClick={data?.onSelectAll}>
                        Select All
                        <ContextMenuShortcut>Ctrl + A</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={data?.onClearSelection} onClick={data?.onClearSelection}>
                        Clear Selection
                        <ContextMenuShortcut>Esc</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem variant="destructive" onSelect={data?.onDelete} onClick={data?.onDelete}>
                        {data?.hasMultipleSelection ? "Delete selection" : "Delete"}
                        <ContextMenuShortcut>Del</ContextMenuShortcut>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            {showAddNextPointer && (
                <div className={`nodrag nopan pointer-events-none absolute left-full top-1/2 z-20 flex -translate-y-1/2 items-center pl-2 transition-opacity duration-200 ${isConnectingFromPointer ? 'opacity-0' : 'opacity-100'}`}>
                    <div className='pointer-events-none h-px w-10 bg-neutral-300' />
                    <div className='group relative size-5'>
                        <button
                            className='!pointer-events-auto -left-2.5 !top-3 !m-0 !flex !size-5 !translate-x-0 !translate-y-0 !items-center !justify-center !rounded-sm !border-0 !bg-neutral-200 hover:bg-neutral-300 transition'
                            onClick={(event: ReactMouseEvent) => {
                                event.stopPropagation();
                                if (id) data?.onAddNext?.(id);
                            }}
                        />
                        <PlusIcon className='pointer-events-none absolute left-2.5 top-2.5 z-30 size-3 -translate-x-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-neutral-600 transition' />
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(TriggerNode);
