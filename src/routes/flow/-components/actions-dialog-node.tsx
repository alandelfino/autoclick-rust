import { memo } from 'react';
import { MessagesSquareIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const actionsDialogNode = (props: any) => (
    <WorkflowNode {...props} icon={MessagesSquareIcon} iconClassName='text-emerald-600' label='Actions Dialog' />
);

export default memo(actionsDialogNode);
