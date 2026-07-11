import { memo } from 'react';
import { TriangleAlertIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const alertDialogNode = (props: any) => (
    <WorkflowNode {...props} icon={TriangleAlertIcon} iconClassName='text-red-500' label='Alert Dialog' />
);

export default memo(alertDialogNode);
