import { memo } from 'react';
import { TimerIcon } from 'lucide-react';
import TriggerNode from './trigger-node';

const triggerOnASchedulleNode = (props: any) => (
    <TriggerNode {...props} icon={TimerIcon} iconClassName='text-teal-600' label='Trigger on a schedule' />
);

export default memo(triggerOnASchedulleNode);
