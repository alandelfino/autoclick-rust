import { memo } from 'react';
import { CloudCogIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const apiRequestNode = (props: any) => (
    <WorkflowNode {...props} icon={CloudCogIcon} iconClassName='text-teal-600' label='API Request' />
);

export default memo(apiRequestNode);
