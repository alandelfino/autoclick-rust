import { memo } from 'react';
import { OctagonXIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const stopLoopNode = (props: any) => (
    <WorkflowNode {...props} icon={OctagonXIcon} iconClassName='text-red-500' label='Stop Loop' output={false} />
);

export default memo(stopLoopNode);
