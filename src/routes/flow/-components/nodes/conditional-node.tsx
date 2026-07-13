import { memo } from 'react';
import { GitBranchIcon } from 'lucide-react';
import WorkflowNode from './workflow-node';

const outputs = [
    {
        id: 'true',
        label: 'true',
        labelClassName: 'text-neutral-400',
        style: { top: '30%' }
    },
    {
        id: 'false',
        label: 'false',
        labelClassName: 'text-neutral-400',
        style: { top: '70%' }
    }
];

const conditionalNode = (props: any) => (
    <WorkflowNode
        {...props}
        icon={GitBranchIcon}
        iconClassName='text-amber-600'
        label='Conditional'
        outputs={outputs}
    />
);

export default memo(conditionalNode);
