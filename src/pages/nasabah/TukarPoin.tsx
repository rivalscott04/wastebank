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

  // Mock data - replace with actual API call
  const [rewardItems] = useState<RewardItem[]>([
    {
      id: '1',
      name: 'Pulsa Rp 10.000',
      description: 'Pulsa untuk semua operator',
      points_required: 100,
      category: 'pulsa',
      stock: 50,
      is_available: true
    },
    {
      id: '2',
      name: 'Pulsa Rp 25.000',
      description: 'Pulsa untuk semua operator',
      points_required: 250,
      category: 'pulsa',
      stock: 30,
      is_available: true
    },
    {
      id: '3',
      name: 'Voucher Belanja Rp 50.000',
      description: 'Voucher belanja di minimarket',
      points_required: 500,
      category: 'voucher',
      stock: 20,
      is_available: true
    },
    {
      id: '4',
      name: 'Voucher Grab Food Rp 30.000',
      description: 'Voucher makanan online',
      points_required: 300,
      category: 'food',
      stock: 15,
      is_available: true
    },
    {
      id: '5',
      name: 'Power Bank 10.000mAh',
      description: 'Power bank portable berkualitas',
      points_required: 800,
      category: 'electronics',
      stock: 5,
      is_available: true
    },
    {
      id: '6',
      name: 'Voucher Steam Rp 100.000',
      description: 'Voucher game Steam',
      points_required: 1000,
      category: 'other',
      stock: 10,
      is_available: true
    },
    {
      id: '7',
      name: 'Tumbler Stainless Steel',
      description: 'Tumbler ramah lingkungan 500ml',
      points_required: 600,
      category: 'other',
      stock: 0,
      is_available: false
    }
  ]);

  const [exchangeHistory] = useState<ExchangeHistory[]>([
    {
      id: 'EXC001',
      reward_name: 'Pulsa Rp 10.000',
      points_used: 100,
      date: '2024-06-12',
      status: 'completed'
    },
    {
      id: 'EXC002',
      reward_name: 'Voucher Belanja Rp 25.000',
      points_used: 250,
      date: '2024-06-08',
      status: 'completed'
    }
  ]);

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
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user is logged in and is nasabah
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

      // Get user points from localStorage or API
      const savedPoints = localStorage.getItem('userPoints');
      if (savedPoints) {
        setUserPoints(parseInt(savedPoints));
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update user points
      const newPoints = userPoints - selectedItem.points_required;
      setUserPoints(newPoints);
      localStorage.setItem('userPoints', newPoints.toString());

      toast.success("Penukaran Berhasil!", {
        description: `${selectedItem.name} berhasil ditukar dengan ${selectedItem.points_required} poin`
      });

      // Switch to history tab
      setActiveTab('history');

    } catch (error) {
      toast.error("Penukaran Gagal", {
        description: "Terjadi kesalahan saat menukar poin. Silakan coba lagi."
      });
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const IconComponent = getCategoryIcon(item.category);
                  const canAfford = userPoints >= item.points_required;
                  const isAvailable = item.is_available && item.stock > 0;

                  return (
                    <Card
                      key={item.id}
                      className={`hover:shadow-lg transition-all duration-300 ${
                        !isAvailable ? 'opacity-60' : ''
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getCategoryColor(item.category)}`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-bank-green-600">
                              {item.points_required.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">poin</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <h3 className="font-bold text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>

                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              Stok: {item.stock}
                            </Badge>
                            {!isAvailable && (
                              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                Tidak Tersedia
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={() => handleExchange(item)}
                          disabled={!canAfford || !isAvailable || isExchanging}
                          className={`w-full hover-scale ${
                            canAfford && isAvailable
                              ? 'bg-bank-green-600 hover:bg-bank-green-700 text-white'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {!isAvailable ? (
                            'Tidak Tersedia'
                          ) : !canAfford ? (
                            `Butuh ${(item.points_required - userPoints).toLocaleString()} poin lagi`
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Tukar Sekarang
                            </>
                          )}
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
                ) : (
                  <div className="space-y-4">
                    {exchangeHistory.map((exchange) => (
                      <div
                        key={exchange.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Gift className="w-6 h-6 text-purple-600" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-800">{exchange.reward_name}</h4>
                              <Badge className={getStatusColor(exchange.status)}>
                                {getStatusText(exchange.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {exchange.id} • {formatDate(exchange.date)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">
                            -{exchange.points_used.toLocaleString()} Poin
                          </p>
                        </div>
                      </div>
                    ))}
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
    </div>
  );
};

export default TukarPoin;
