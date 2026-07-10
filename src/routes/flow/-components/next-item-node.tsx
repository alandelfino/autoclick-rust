import { memo } from 'react';
import { StepForwardIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const nextItemNode = (props: any) => (
    <WorkflowNode {...props} icon={StepForwardIcon} iconClassName='text-violet-600' label='Next Item' />
);

export default memo(nextItemNode);
