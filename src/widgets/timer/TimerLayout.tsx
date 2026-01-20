import type { ReactNode } from 'react';

type TimerLayoutProps = {
  children: ReactNode;
};

function TimerLayout({ children }: TimerLayoutProps) {
  return (
    <div className="page-center" style={{ flexDirection: 'column' }}>
      {children}
    </div>
  );
}

export default TimerLayout;
