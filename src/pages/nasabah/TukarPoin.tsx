import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NasabahSidebar from '@/components/NasabahSidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Gift,
  Star,
  Search,
  Filter,
  ShoppingCart,
  Smartphone,
  Zap,
  ShoppingBag,
  Coffee,
  Gamepad2,
  History,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';
import { useIsMobile } from '@/hooks/use-mobile';

interface RewardItem {
  id: string;
  name: string;
  description: string;
  points_required: number;
  category: 'pulsa' | 'voucher' | 'electronics' | 'food' | 'other';
  stock: number;
  image_url?: string;
  is_available: boolean;
}

interface ExchangeHistory {
  id: string;
  reward_name: string;
  points_used: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

const TukarPoin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(1250);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');
  const [selectedItem, setSelectedItem] = useState<RewardItem | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isExchanging, setIsExchanging] = useState(false);
  const [rewardItems, setRewardItems] = useState<RewardItem[]>([]);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeHistory[]>([]);
  const isMobile = useIsMobile();
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedCancelId, setSelectedCancelId] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'Semua', icon: Gift },
    { id: 'pulsa', name: 'Pulsa', icon: Smartphone },
    { id: 'voucher', name: 'Voucher', icon: ShoppingBag },
    { id: 'electronics', name: 'Elektronik', icon: Zap },
    { id: 'food', name: 'Makanan', icon: Coffee },
    { id: 'other', name: 'Lainnya', icon: Gamepad2 }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = localStorage.getItem('user');
        if (!user) {
          navigate('/login');
          return;
        }
        const userData = JSON.parse(user);
        if (userData.role !== 'nasabah') {
          navigate('/login');
          return;
        }
        // Get user points from API
        const me = await api.get('/auth/me');
        setUserPoints(me.data.total_points || 0);
        // Fetch rewards
        const rewardsRes = await api.get('/rewards');
        setRewardItems(rewardsRes.data.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          points_required: r.points_required,
          category: r.category || 'other',
          stock: r.stock,
          image_url: r.image,
          is_available: r.is_active && r.stock > 0
        })));
        // Fetch exchange history
        const historyRes = await api.get('/reward-redemptions');
        setExchangeHistory((historyRes.data || []).map((h: any) => ({
          id: h.id,
          reward_name: h.reward?.name || '-',
          points_used: h.points_spent,
          date: h.createdAt,
          status: h.status
        })));
      } catch (e) {
        toast.error('Gagal memuat data tukar poin');
      }
      setIsLoading(false);
    };
    loadData();
  }, [navigate]);

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : Gift;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pulsa':
        return 'bg-blue-100 text-blue-600';
      case 'voucher':
        return 'bg-green-100 text-green-600';
      case 'electronics':
        return 'bg-purple-100 text-purple-600';
      case 'food':
        return 'bg-orange-100 text-orange-600';
      case 'other':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredItems = rewardItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExchange = (item: RewardItem) => {
    if (userPoints < item.points_required) {
      toast.error("Poin Tidak Cukup", {
        description: `Anda membutuhkan ${item.points_required} poin, tetapi hanya memiliki ${userPoints} poin`
      });
      return;
    }

    if (!item.is_available || item.stock === 0) {
      toast.error("Item Tidak Tersedia", {
        description: "Maaf, item ini sedang tidak tersedia"
      });
      return;
    }

    setSelectedItem(item);
    setShowConfirmDialog(true);
  };

  const confirmExchange = async () => {
    if (!selectedItem) return;
    setIsExchanging(true);
    setShowConfirmDialog(false);
    try {
      await api.post('/reward-redemptions', { reward_id: selectedItem.id });
      toast({ title: 'Penukaran Berhasil!', description: `${selectedItem.name} berhasil ditukar dengan ${selectedItem.points_required} poin`, variant: 'default' });
      setActiveTab('history');
      // Refresh data
      const me = await api.get('/auth/me');
      setUserPoints(me.data.total_points || 0);
      const historyRes = await api.get('/reward-redemptions');
      setExchangeHistory((historyRes.data || []).map((h: any) => ({
        id: h.id,
        reward_name: h.reward?.name || '-',
        points_used: h.points_spent,
        date: h.createdAt,
        status: h.status
      })));
    } catch (error) {
      toast.error('Penukaran Gagal', { description: 'Terjadi kesalahan saat menukar poin. Silakan coba lagi.' });
    } finally {
      setIsExchanging(false);
      setSelectedItem(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'pending':
        return 'Menunggu';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleCancel = async (id: string) => {
    try {
      await api.patch(`/reward-redemptions/${id}/status`, { status: 'cancelled' });
      toast({ title: 'Berhasil membatalkan penukaran', variant: 'default' });
      // Refresh data
      const me = await api.get('/auth/me');
      setUserPoints(me.data.total_points || 0);
    } catch (err) {
      toast({ title: 'Gagal membatalkan penukaran', variant: 'destructive' });
    }
    setOpenCancelDialog(false);
    setSelectedCancelId(null);
  };

  // Hitung total poin pending
  const totalPendingPoints = exchangeHistory
    .filter(item => item.status === 'pending')
    .reduce((sum, item) => sum + item.points_used, 0);
  const displayedPoints = userPoints - totalPendingPoints;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NasabahSidebar />
        <div className="lg:ml-64">
          <main className="p-4 pt-16 lg:pt-8">
            <SkeletonLoader type="tukar-poin" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NasabahSidebar />

      <div className="lg:ml-64">
        <main className="p-4 pt-16 lg:pt-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 pl-12 lg:pl-0">
              <Gift className="w-8 h-8 mr-3 text-bank-green-600" />
              Tukar Poin
            </h1>
            <p className="text-gray-600 mt-1">Tukarkan poin Anda dengan berbagai hadiah menarik</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-white text-bank-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Katalog Hadiah
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-bank-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Riwayat Tukar
            </button>
          </div>

          {activeTab === 'catalog' ? (
            <>
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Cari hadiah..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {categories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                              selectedCategory === category.id
                                ? 'bg-bank-green-100 text-bank-green-700 border border-bank-green-200'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span>{category.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rewards Grid */}
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
                {filteredItems.map((item) => {
                  const IconComponent = getCategoryIcon(item.category);
                  const canAfford = displayedPoints >= item.points_required;
                  const isAvailable = item.is_available && item.stock > 0;

                  return (
                    <Card
                      key={item.id}
                      className={`hover:shadow-lg transition-shadow duration-300 ${
                        !isAvailable ? 'opacity-60' : ''
                      }`}
                    >
                      <CardContent className="p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(item.category)}`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-bank-green-700">{item.points_required} Poin</span>
                          <span className="text-xs text-gray-500">Stok: {item.stock}</span>
                        </div>
                        <Button
                          className="w-full mt-2 text-base py-2 btn-primary hover-scale"
                          disabled={!item.is_available || displayedPoints < item.points_required}
                          onClick={() => handleExchange(item)}
                        >
                          {item.is_available ? 'Tukar' : 'Stok Habis'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredItems.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Tidak ada hadiah</h3>
                    <p className="text-gray-500">Tidak ada hadiah yang sesuai dengan pencarian Anda</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* History Tab */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2 text-blue-600" />
                  Riwayat Penukaran Poin
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exchangeHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada riwayat</h3>
                    <p className="text-gray-500">Anda belum pernah menukar poin</p>
                  </div>
                ) : isMobile ? (
                  <div className="space-y-3">
                    {exchangeHistory.map((item) => (
                      <Card key={item.id} className="p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">{item.reward_name}</span>
                          <Badge className={getStatusColor(item.status)}>{getStatusText(item.status)}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatDate(item.date)}</span>
                          <span>-{item.points_used} Poin</span>
                        </div>
                        {item.status === 'pending' && (
                          <Button type="button" size="sm" variant="destructive" className="mt-2" onClick={() => { setSelectedCancelId(item.id); setOpenCancelDialog(true); }}>
                            Batalkan
                          </Button>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full border text-sm md:text-base">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border">Reward</th>
                          <th className="p-2 border">Tanggal</th>
                          <th className="p-2 border">Poin</th>
                          <th className="p-2 border">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exchangeHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-2 border">{item.reward_name}</td>
                            <td className="p-2 border">{formatDate(item.date)}</td>
                            <td className="p-2 border">-{item.points_used}</td>
                            <td className="p-2 border">
                              <Badge className={getStatusColor(item.status)}>{getStatusText(item.status)}</Badge>
                              {item.status === 'pending' && (
                                <Button type="button" size="sm" variant="destructive" className="ml-2" onClick={() => { setSelectedCancelId(item.id); setOpenCancelDialog(true); }}>
                                  Batalkan
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmExchange}
        title="Konfirmasi Penukaran Poin"
        description={
          selectedItem
            ? `Apakah Anda yakin ingin menukar ${selectedItem.points_required} poin dengan ${selectedItem.name}?`
            : ""
        }
        confirmText="Tukar Sekarang"
        cancelText="Batal"
        type="warning"
      />

      <ConfirmDialog
        isOpen={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
        onConfirm={() => { if (selectedCancelId) handleCancel(selectedCancelId); }}
        title="Batalkan Penukaran?"
        description="Penukaran yang dibatalkan tidak bisa dikembalikan. Yakin ingin membatalkan?"
        confirmText="Batalkan"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default TukarPoin;
