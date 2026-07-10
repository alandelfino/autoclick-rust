import { memo } from 'react';
import { DatabaseZapIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const mysqlQueryNode = (props: any) => (
    <WorkflowNode {...props} icon={DatabaseZapIcon} iconClassName='text-cyan-600' label='MySQL Query' />
);

export default memo(mysqlQueryNode);
