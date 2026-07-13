import { memo } from 'react';
import { RepeatIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const loopNode = (props: any) => (
    <WorkflowNode {...props} icon={RepeatIcon} iconClassName='text-violet-600' label='Loop' />
);

export default memo(loopNode);
