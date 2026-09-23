import { useAuth } from "../../context/AuthContext";
import GamificationDashboardCard from "../../features/gamification/components/GamificationDashboardCard";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome, {user?.name}</p>
      <GamificationDashboardCard />
    </div>
  );
}

export default Dashboard;
