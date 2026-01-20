import { MotivationFooter } from '@features/timer';

type TimerFooterProps = {
  text: string;
};

function TimerFooter({ text }: TimerFooterProps) {
  return <MotivationFooter text={text} />;
}

export default TimerFooter;
