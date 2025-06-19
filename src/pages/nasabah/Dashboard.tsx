import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle }from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import NasabahSidebar from '@/components/NasabahSidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import {
  User,
  Recycle,
  TrendingUp,
  Gift,
  History,
  Truck,
  Award,
  Star
} from 'lucide-react';

const NasabahDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    totalWaste: 0,
    totalTransactions: 0,
    rank: '',
    nextRankPoints: 0
  });
  const [wasteTypes, setWasteTypes] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Check if user is logged in and is nasabah
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/login');
        return;
      }
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'nasabah') {
        toast.error("Akses Ditolak", {
          description: "Anda tidak memiliki akses ke halaman nasabah",
        });
        navigate('/');
        return;
      }
      setUser(parsedUser);
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setUserStats({
          totalPoints: data.points || 0,
          totalWaste: data.total_waste_collected || 0,
          totalTransactions: data.total_transactions || 0,
          rank: data.rank || '',
          nextRankPoints: data.next_rank_points || 0
        });
        // Fetch waste prices
        const priceRes = await fetch('/api/waste-prices', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const prices = await priceRes.json();
        setWasteTypes(prices.map((p: any) => ({
          name: p.category?.name || '-',
          price: `Rp ${Number(p.price_per_kg).toLocaleString('id-ID')}/Kg`,
          points: `${p.points_per_kg} poin/Kg`,
          icon: p.icon || ''
        })));
      } catch (e) {
        toast.error('Gagal memuat data dashboard');
      }
      setIsLoading(false);
    };
    loadData();
  }, [navigate]);

  const recentTransactions = [
    {
      id: 1,
      date: "2024-01-15",
      type: "Plastik PET",
      weight: "2.5 Kg",
      points: 75,
      status: "completed"
    },
    {
      id: 2,
      date: "2024-01-12",
      type: "Kertas Kardus",
      weight: "5.0 Kg",
      points: 100,
      status: "completed"
    },
    {
      id: 3,
      date: "2024-01-10",
      type: "Botol Kaca",
      weight: "3.2 Kg",
      points: 160,
      status: "completed"
    }
  ];

  const achievements = [
    {
      title: "First Timer",
      description: "Transaksi pertama",
      earned: userStats.totalTransactions > 0,
      icon: "🎉"
    },
    {
      title: "Eco Warrior",
      description: "50+ Kg sampah terkumpul",
      earned: userStats.totalWaste >= 50,
      icon: "🌱"
    },
    {
      title: "Point Master",
      description: "1000+ poin dikumpulkan",
      earned: userStats.totalPoints >= 1000,
      icon: "⭐"
    },
    {
      title: "Green Champion",
      description: "100+ Kg sampah terkumpul",
      earned: userStats.totalWaste >= 100,
      icon: "🏆"
    }
  ];

  const progressToNextRank = ((userStats.totalPoints % 1000) / 1000) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <NasabahSidebar />
        <div className="flex-1 ml-0 lg:ml-64 p-8 pt-16 lg:pt-8">
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
      <NasabahSidebar />

      <div className="flex-1 ml-0 lg:ml-64">
        {/* Main Content */}
        <main className="p-4 pt-16 lg:p-8 lg:pt-8">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl font-bold flex items-center gap-2 pl-12 lg:pl-0">
              Selamat datang kembali! 👋
            </h1>
            <p className="text-gray-600">
              Mari kita lihat progress lingkungan Anda hari ini.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats & Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow duration-300 hover-scale">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Poin</p>
                        <p className="text-2xl font-bold text-bank-green-600">{userStats.totalPoints}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300 hover-scale">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Sampah Terkumpul</p>
                        <p className="text-2xl font-bold text-blue-600">{userStats.totalWaste} Kg</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Recycle className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300 hover-scale">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Transaksi</p>
                        <p className="text-2xl font-bold text-purple-600">{userStats.totalTransactions}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rank Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-600" />
                    Rank Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="bg-gray-200 text-gray-800">
                        {userStats.rank}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {userStats.nextRankPoints} poin lagi ke Gold
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {Math.round(progressToNextRank)}%
                    </span>
                  </div>
                  <Progress value={progressToNextRank} className="h-3 bg-gray-200" />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Aksi Cepat</CardTitle>
                  <CardDescription>
                    Fitur-fitur yang sering digunakan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      className="h-auto p-4 justify-start hover-scale"
                      variant="outline"
                      onClick={() => toast.info("Fitur Request Jemput", { description: "Akan segera tersedia" })}
                    >
                      <Truck className="w-5 h-5 mr-3 text-orange-600" />
                      <div className="text-left">
                        <div className="font-medium">Request Jemput</div>
                        <div className="text-sm text-gray-500">Jadwalkan penjemputan sampah</div>
                      </div>
                    </Button>

                    <Button
                      className="h-auto p-4 justify-start hover-scale"
                      variant="outline"
                      onClick={() => toast.info("Fitur Riwayat Transaksi", { description: "Akan segera tersedia" })}
                    >
                      <History className="w-5 h-5 mr-3 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium">Riwayat Transaksi</div>
                        <div className="text-sm text-gray-500">Lihat transaksi sebelumnya</div>
                      </div>
                    </Button>

                    <Button
                      className="h-auto p-4 justify-start hover-scale"
                      variant="outline"
                      onClick={() => toast.info("Fitur Tukar Poin", { description: "Akan segera tersedia" })}
                    >
                      <Gift className="w-5 h-5 mr-3 text-purple-600" />
                      <div className="text-left">
                        <div className="font-medium">Tukar Poin</div>
                        <div className="text-sm text-gray-500">Gunakan poin untuk hadiah</div>
                      </div>
                    </Button>

                    <Button
                      className="h-auto p-4 justify-start hover-scale"
                      variant="outline"
                      onClick={() => toast.info("Fitur Update Profil", { description: "Akan segera tersedia" })}
                    >
                      <User className="w-5 h-5 mr-3 text-green-600" />
                      <div className="text-left">
                        <div className="font-medium">Update Profil</div>
                        <div className="text-sm text-gray-500">Kelola informasi akun</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Info & Activities */}
            <div className="space-y-6">
              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-600" />
                    Pencapaian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                          achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <h4 className={`font-medium ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-xs ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`}>
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.earned && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Waste Price List */}
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Harga Sampah</CardTitle>
                  <CardDescription>
                    Harga dan poin per kilogram
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {wasteTypes.map((waste, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{waste.icon}</span>
                          <div>
                            <h4 className="font-medium text-gray-800">{waste.name}</h4>
                            <p className="text-sm text-gray-500">{waste.price}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-bank-green-100 text-bank-green-800">
                          {waste.points}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="w-5 h-5 mr-2 text-blue-600" />
                    Transaksi Terbaru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <h4 className="font-medium text-gray-800">{transaction.type}</h4>
                          <p className="text-sm text-gray-500">{transaction.weight} • {transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-bank-green-600">+{transaction.points} poin</p>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Selesai
                          </Badge>
                        </div>
                      </div>
                    ))}
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

export default NasabahDashboard;
