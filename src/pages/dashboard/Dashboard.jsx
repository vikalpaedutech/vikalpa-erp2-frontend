import { useAuth } from "../../context/AuthContext";
import { administrationItems } from "../../config/navigation";
import { Link } from "react-router-dom";
import GamificationDashboardCard from "../../features/gamification/components/GamificationDashboardCard";

function Dashboard() {
  const { user, isAdmin, can } = useAuth();
  const dashboardItems = administrationItems.filter((item) =>
    item.section === "Dashboards" && (isAdmin || can(item.permission))
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome, {user?.name}</p>
      </div>
      {dashboardItems.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Dashboards</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {dashboardItems.map((item) => (
              <Link key={item.path} to={item.path} className="rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      )}
      <GamificationDashboardCard />
    </div>
  );
}

export default Dashboard;
