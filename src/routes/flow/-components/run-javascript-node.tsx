import { memo } from 'react';
import { FileCode2Icon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const runJavascriptNode = (props: any) => (
    <WorkflowNode {...props} icon={FileCode2Icon} iconClassName='text-yellow-600' label='Run Javascript' />
);

export default memo(runJavascriptNode);
