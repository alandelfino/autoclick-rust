import { memo } from 'react';
import { DatabaseIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const postgresqlQueryNode = (props: any) => (
    <WorkflowNode {...props} icon={DatabaseIcon} iconClassName='text-blue-600' label='PostgreSQL Query' />
);

export default memo(postgresqlQueryNode);
