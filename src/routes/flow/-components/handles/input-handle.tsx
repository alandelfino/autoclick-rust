import { Handle, Position } from '@xyflow/react';
import { cn } from '../../../../lib/utils';

const CustomInputHandle = ({ id, position = Position.Right, className, ...props }: { id: string, position: Position, isConnectable?: boolean, className?: string, [key: string]: any }) => {

    // Função opcional para validar conexões (ex: evitar conectar um nó nele mesmo)
    const validateConnection = (connection: any) => {
        // Exemplo: Não permite conectar se a origem for igual ao destino
        return connection.source !== connection.target;
    };

    return (
        <Handle
            type="target"          // Força o tipo a ser sempre "source" (saída)
            position={position}    // Padrão é na direita, mas aceita outras posições
            id={id}                // Importante se o nó tiver múltiplas saídas
            isValidConnection={validateConnection}
            {...props}            // Repassa outras propriedades como onConnect, isConnectable, etc.
            className={cn('w-3 h-5 rounded-all bg-neutral-300 border border-neutral-300 z-10 rounded-none rounded-l-full -left-1.5', className)}
        />
    );
};

export default CustomInputHandle;
