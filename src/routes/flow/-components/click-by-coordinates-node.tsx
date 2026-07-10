import { Position } from '@xyflow/react'; // Nota: A partir da v12, o pacote mudou para @xyflow/react
import { memo } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { MousePointer, PlayIcon } from 'lucide-react';
import CustomOutputHandle from './output-handle';

const startNode = () => {
    return (
        <Card className='rounded-sm rounded-l-4xl w-16 h-16 border-neutral-300'>
            <CardContent className='flex items-center justify-center w-full h-full gap-2'>
                <MousePointer className='size-6 text-green-600' />

                {/* Handler */}
                <CustomOutputHandle
                    type="source"
                    position={Position.Right}
                    id="a"
                    isConnectable={true}
                />

                <span className='text-[10px] text-neutral-400 absolute top-17 left-0 w-full max-w-17 flex justify-center text-center'>Start you flow</span>
            </CardContent>
        </Card>
    );
};

// Memoizar o componente evita renderizações desnecessárias e melhora a performance
export default memo(startNode);