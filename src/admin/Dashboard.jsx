import { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, TrendingUp, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { getDashboardStats } from '../services/api';
import { getAdminUser } from '../services/auth';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_visitors: 0,
    today_visitors: 0,
    this_week_visitors: 0,
    this_month_visitors: 0,
  });
  const [loading, setLoading] = useState(true);
  const adminUser = getAdminUser();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const result = await getDashboardStats();
    setLoading(false);

    if (result.success) {
      let visitors = [];
      // Handle different response structures (Array or Paginated Object)
      if (Array.isArray(result.data)) {
        visitors = result.data;
      } else if (result.data?.results && Array.isArray(result.data.results)) {
        visitors = result.data.results;
      } else if (result.data?.total_visitors !== undefined) {
        setStats(result.data);
        return;
      }

      // Calculate stats locally
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).getTime(); // Start of week (Sunday)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

      const stats = visitors.reduce((acc, visitor) => {
        const checkinDate = new Date(visitor.checkin_time || visitor.entry_time || visitor.created_at || Date.now());
        const checkinTime = checkinDate.getTime();

        acc.total_visitors++;

        if (checkinTime >= today) {
          acc.today_visitors++;
        }

        // This week (simple approximation)
        if (checkinTime >= weekStart) {
          acc.this_week_visitors++;
        }

        if (checkinTime >= monthStart) {
          acc.this_month_visitors++;
        }

        return acc;
      }, {
        total_visitors: 0,
        today_visitors: 0,
        this_week_visitors: 0,
        this_month_visitors: 0,
      });

      // If paginated and total count is available, use it for total_visitors
      if (result.data?.count) {
        stats.total_visitors = result.data.count;
      }

      setStats(stats);
    }
  };

  const statCards = [
    {
      title: 'Total Visitors',
      value: stats.total_visitors || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Today',
      value: stats.today_visitors || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'This Week',
      value: stats.this_week_visitors || 0,
      icon: Clock,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'This Month',
      value: stats.this_month_visitors || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 transition-all duration-300">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden mr-4 p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Welcome back, {adminUser?.name || 'Admin'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{adminUser?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{adminUser?.email || 'admin@example.com'}</p>
              </div>
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {(adminUser?.name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bgLight} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                  {loading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded skeleton"></div>
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/visitors"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Users className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="font-semibold text-gray-900">View All Visitors</p>
                  <p className="text-xs text-gray-500">Manage visitor records</p>
                </div>
              </a>

              <button
                onClick={fetchStats}
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">Refresh Stats</p>
                  <p className="text-xs text-gray-500">Update dashboard data</p>
                </div>
              </button>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <UserCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Visitor Form</p>
                  <p className="text-semibold text-gray-900">Visitor Form</p>
                  <p className="text-xs text-gray-500">Open registration page</p>
                </div>
              </a>
            </div>
          </div>


        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {import.meta.env.VITE_COMPANY_NAME || 'SRIA INFOTECH PVT LTD'}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
