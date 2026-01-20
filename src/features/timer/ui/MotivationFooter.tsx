type MotivationFooterProps = {
  text: string;
};

function MotivationFooter({ text }: MotivationFooterProps) {
  return (
    <div className="motivation-footer">
      <div className="motivation-label">오늘의 문구</div>
      <div className="motivation-text">"{text}"</div>
    </div>
  );
}

export default MotivationFooter;
