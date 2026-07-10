import { memo } from 'react';
import { MoveIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const moveCursorNode = (props: any) => (
    <WorkflowNode {...props} icon={MoveIcon} iconClassName='text-blue-500' label='Move cursor' />
);

export default memo(moveCursorNode);
