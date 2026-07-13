import { memo } from 'react';
import { PlayIcon } from 'lucide-react';
import TriggerNode from './trigger-node';

const triggerManuallyNode = (props: any) => (
    <TriggerNode {...props} icon={PlayIcon} iconClassName='text-green-600' label='Trigger manually' />
);

export default memo(triggerManuallyNode);
