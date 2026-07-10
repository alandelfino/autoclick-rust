import { memo } from 'react';
import { ArrowBigDownDash } from 'lucide-react';
import WorkflowNode from './workflow-node';

const keypressNode = (props: any) => (
    <WorkflowNode {...props} icon={ArrowBigDownDash} iconClassName='text-rose-500' label='Key press on keyboard' />
);

export default memo(keypressNode);
