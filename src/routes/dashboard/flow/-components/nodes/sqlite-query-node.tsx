import { memo } from 'react';
import { DatabaseBackupIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const sqliteQueryNode = (props: any) => (
    <WorkflowNode {...props} icon={DatabaseBackupIcon} iconClassName='text-indigo-600' label='SQLite Query' />
);

export default memo(sqliteQueryNode);
