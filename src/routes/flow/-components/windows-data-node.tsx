import { memo } from 'react';
import { MonitorCogIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const windowsDataNode = (props: any) => (
    <WorkflowNode {...props} icon={MonitorCogIcon} iconClassName='text-sky-600' label='Windows data' />
);

export default memo(windowsDataNode);
