import { memo } from 'react';
import { ListTreeIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const switchCaseNode = (props: any) => (
    <WorkflowNode {...props} icon={ListTreeIcon} iconClassName='text-amber-600' label='Switch Case' />
);

export default memo(switchCaseNode);
