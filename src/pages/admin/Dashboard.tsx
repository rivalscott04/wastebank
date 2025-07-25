import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import {
  Users,
  Recycle,
  TrendingUp,
  ShoppingCart,
  UserPlus,
  Package,
  Truck,
  BarChart3,
  Activity
} from 'lucide-react';
import { userService } from '@/services/user.service';
import { transactionService } from '@/services/transaction.service';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWeight: 0,
    totalTransactions: 0,
    totalPoints: 0
  });
  const [error, setError] = useState('');
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Check if user is logged in and is admin
        const userData = localStorage.getItem('user');
        if (!userData) {
          navigate('/login');
          return;
        }
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'admin') {
          toast.error('Akses Ditolak', { description: 'Anda tidak memiliki akses ke halaman admin' });
          navigate('/');
          return;
        }
        setUser(parsedUser);
        // Fetch data
        const [users, transactions, totalWeightRes] = await Promise.all([
          userService.getAllUsers(),
          transactionService.getAllTransactions(),
          fetch('/api/dashboard/total-weight', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }).then(res => res.json())
        ]);
        setStats({
          totalUsers: users.length,
          totalWeight: totalWeightRes.totalWeight || 0,
          totalTransactions: transactions.length,
          totalPoints: transactions.reduce((sum, t) => sum + Number(t.total_points || 0), 0)
        });
        // Fetch aktivitas terbaru
        const res = await fetch('/api/dashboard/activities', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        } else {
          setActivities([]);
        }
      } catch (e) {
        console.error('Dashboard error:', e);
        setError('Gagal memuat data dashboard');
      }
      setIsLoading(false);
    };
    loadData();
  }, [navigate]);

  const statsArr = [
    {
      title: 'Total Nasabah',
      value: stats.totalUsers.toLocaleString('id-ID'),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Sampah Terkumpul',
      value: stats.totalWeight.toLocaleString('id-ID') + ' Kg',
      icon: Recycle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Transaksi',
      value: stats.totalTransactions.toLocaleString('id-ID'),
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Poin Dibagikan',
      value: stats.totalPoints.toLocaleString('id-ID'),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const quickActions = [
    {
      title: "Kelola Nasabah",
      description: "Tambah, edit, atau hapus data nasabah",
      icon: UserPlus,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => toast.info("Fitur Kelola Nasabah", { description: "Akan segera tersedia" })
    },
    {
      title: "Kelola Kategori",
      description: "Atur kategori dan jenis sampah",
      icon: Package,
      color: "bg-green-500 hover:bg-green-600",
      action: () => toast.info("Fitur Kelola Kategori", { description: "Akan segera tersedia" })
    },
    {
      title: "Kelola Transaksi",
      description: "Monitor dan kelola transaksi",
      icon: ShoppingCart,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => toast.info("Fitur Kelola Transaksi", { description: "Akan segera tersedia" })
    },
    {
      title: "Kelola Jemput Sampah",
      description: "Atur permintaan jemput sampah",
      icon: Truck,
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => toast.info("Fitur Kelola Jemput", { description: "Akan segera tersedia" })
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="w-64 bg-white shadow-xl border-r border-gray-200">
          <div className="p-4 space-y-4">
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-8">
          <SkeletonLoader type="dashboard" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role="admin" />

      <div className="flex-1 lg:ml-0">
        {/* Main Content */}
        <main className="p-4 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl font-bold flex items-center gap-2 pl-12 lg:pl-0">
              Dashboard Admin
            </h1>
            <p className="text-gray-600">
              Berikut adalah ringkasan aktivitas Bank Sampah Digital hari ini
            </p>
          </div>

          {/* Stats Grid */}
          {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsArr.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 hover-scale">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-bank-green-600" />
                    Aksi Cepat
                  </CardTitle>
                  <CardDescription>
                    Fitur-fitur utama untuk mengelola sistem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <div
                        key={index}
                        onClick={action.action}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer hover:border-bank-green-300 group hover-scale"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center transition-colors`}>
                            <action.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 group-hover:text-bank-green-700 transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-bank-blue-600" />
                    Aktivitas Terbaru
                  </CardTitle>
                  <CardDescription>
                    Aktivitas sistem dalam 24 jam terakhir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.length === 0 ? (
                      <div className="text-gray-400 italic">Belum ada aktivitas terbaru</div>
                    ) : (
                      activities.map((activity, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === 'user' ? 'bg-blue-100' :
                            activity.type === 'transaction' ? 'bg-green-100' :
                            activity.type === 'pickup' ? 'bg-orange-100' :
                            'bg-purple-100'
                          }`}>
                            {activity.type === 'user' && <Users className="w-4 h-4 text-blue-600" />}
                            {activity.type === 'transaction' && <ShoppingCart className="w-4 h-4 text-green-600" />}
                            {activity.type === 'pickup' && <Truck className="w-4 h-4 text-orange-600" />}
                            {activity.type === 'reward' && <Package className="w-4 h-4 text-purple-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                            <p className="text-sm text-gray-500">{activity.user}</p>
                            <p className="text-xs text-gray-400">{new Date(activity.time).toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
