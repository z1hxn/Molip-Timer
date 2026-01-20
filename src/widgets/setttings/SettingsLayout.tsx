import type { ReactNode } from 'react';

type SettingsLayoutProps = {
  children: ReactNode;
};

function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="page-center">
      <div className="card settings-card">{children}</div>
    </div>
  );
}

export default SettingsLayout;
