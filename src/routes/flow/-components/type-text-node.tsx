import { memo } from 'react';
import { TypeIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const typeTextNode = (props: any) => (
    <WorkflowNode {...props} icon={TypeIcon} iconClassName='text-rose-500' label='Type text on keyboard' />
);

export default memo(typeTextNode);
