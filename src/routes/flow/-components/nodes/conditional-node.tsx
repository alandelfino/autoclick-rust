import { memo } from 'react';
import { GitBranchIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const conditionalNode = (props: any) => (
    <WorkflowNode {...props} icon={GitBranchIcon} iconClassName='text-amber-600' label='Conditional' />
);

export default memo(conditionalNode);
