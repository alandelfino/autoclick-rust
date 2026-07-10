import { memo } from 'react';
import { TimerIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const delayNode = (props: any) => (
    <WorkflowNode {...props} icon={TimerIcon} iconClassName='text-orange-500' label='Delay' />
);

export default memo(delayNode);
