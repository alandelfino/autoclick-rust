import { Handle, Position } from '@xyflow/react';

const CustomOutputHandle = ({ id, position = Position.Right, ...props }: { id: string, position: Position, isConnectable?: boolean, [key: string]: any }) => {

    // Função opcional para validar conexões (ex: evitar conectar um nó nele mesmo)
    const validateConnection = (connection: any) => {
        // Exemplo: Não permite conectar se a origem for igual ao destino
        return connection.source !== connection.target;
    };

    return (
        <Handle
            type="source"          // Força o tipo a ser sempre "source" (saída)
            position={position}    // Padrão é na direita, mas aceita outras posições
            id={id}                // Importante se o nó tiver múltiplas saídas
            isValidConnection={validateConnection}
            {...props}            // Repassa outras propriedades como onConnect, isConnectable, etc.
            className='w-2 h-2 bg-neutral-300 border-none z-10 rounded-none rounded-r-full -right-1'
        />
    );
};

export default CustomOutputHandle;