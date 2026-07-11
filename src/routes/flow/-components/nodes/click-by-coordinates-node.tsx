import { memo } from 'react';
import { MousePointerClickIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const clickByCoordinatesNode = (props: any) => (
    <WorkflowNode {...props} icon={MousePointerClickIcon} iconClassName='text-blue-500' label='Click by coordinates' />
);

export default memo(clickByCoordinatesNode);
