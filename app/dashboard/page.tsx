import DashboardContent from './components/DashboardContent';

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardContent />
    </main>
  );
}