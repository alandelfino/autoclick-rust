import { memo } from 'react';
import { VariableIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const variableNode = (props: any) => (
    <WorkflowNode {...props} icon={VariableIcon} iconClassName='text-fuchsia-600' label='Variable' />
);

export default memo(variableNode);
