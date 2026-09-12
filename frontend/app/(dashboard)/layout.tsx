import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <DashboardHeader />
      
      <main style={{ flex: 1 }}>
        {children}
      </main>
      
      <DashboardFooter />
    </div>
  );
}