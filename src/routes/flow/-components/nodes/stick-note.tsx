import { memo } from 'react';
import { NodeResizer } from '@xyflow/react';

type StickNoteNodeProps = {
    selected?: boolean;
    data?: {
        label?: string;
        description?: string;
    };
};

const StickNoteNode = ({ selected, data }: StickNoteNodeProps) => {
    const label = data?.label ?? "I'm a note";
    const description = data?.description ?? "Double click to edit me. Guide";

    // Replaces 'Guide' with a colored span to match the design mockup
    const renderDescription = (text: string) => {
        if (text.includes("Guide")) {
            const parts = text.split("Guide");
            return (
                <>
                    {parts[0]}
                    <span className="text-[#FF7675] hover:underline cursor-pointer transition-colors">Guide</span>
                    {parts[1]}
                </>
            );
        }
        return text;
    };

    return (
        <>
            <NodeResizer 
                isVisible={selected} 
                minWidth={160} 
                minHeight={100} 
                lineClassName="border-amber-400"
                handleClassName="bg-white border-2 border-amber-500 rounded"
            />
            <div 
                className={`w-full h-full p-5 rounded-lg border shadow-sm transition-all text-left flex flex-col justify-start select-none ${
                    selected 
                        ? 'bg-[#FFF9E6]/75 ring-4 ring-amber-400/20 border-amber-400 shadow-md' 
                        : 'bg-[#FFF9E6] border-[#FDE047]'
                }`}
            >
                <h3 className="text-2xl font-bold text-neutral-800 leading-tight mb-3 font-sans tracking-tight">
                    {label}
                </h3>
                <p className="text-sm text-neutral-700 leading-snug whitespace-pre-wrap font-sans">
                    {renderDescription(description)}
                </p>
            </div>
        </>
    );
};

export default memo(StickNoteNode);
