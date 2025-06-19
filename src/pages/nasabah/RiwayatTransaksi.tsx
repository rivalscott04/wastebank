import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NasabahSidebar from '@/components/NasabahSidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  History,
  Search,
  Filter,
  Calendar,
  Star,
  Truck,
  ArrowUpDown,
  Eye,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

interface Transaction {
  id: string;
  date: string;
  type: 'pickup' | 'exchange';
  description: string;
  points: number;
  status: 'completed' | 'pending' | 'cancelled';
  waste_type?: string;
  weight?: number;
  reward_item?: string;
}

const RiwayatTransaksi = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pickup' | 'exchange'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

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
        const res = await api.get('/transactions');
        // Mapping agar sesuai Transaction[]
        const data = (res.data || res).map((trx: any) => ({
          id: trx.id,
          date: trx.createdAt || trx.date,
          type: trx.type || (trx.items && trx.items.length > 0 ? 'pickup' : 'exchange'),
          description: trx.notes || (trx.items && trx.items.length > 0 ? `Penjemputan Sampah ${trx.items.map((i:any)=>i.category?.name).join(', ')}` : 'Tukar Poin'),
          points: trx.total_points || trx.points || 0,
          status: trx.payment_status || trx.status || 'completed',
          waste_type: trx.items && trx.items.length > 0 ? trx.items.map((i:any)=>i.category?.name).join(', ') : undefined,
          weight: trx.total_weight || undefined,
          reward_item: trx.reward_item || undefined
        }));
        setTransactions(data);
      } catch (e) {
        toast.error('Gagal memuat riwayat transaksi');
      }
      setIsLoading(false);
    };
    loadData();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  const getTypeIcon = (type: string) => {
    return type === 'pickup' ? Truck : Star;
  };

  const getTypeColor = (type: string) => {
    return type === 'pickup'
      ? 'bg-blue-100 text-blue-600'
      : 'bg-purple-100 text-purple-600';
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || transaction.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const totalPoints = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.points, 0);

  const completedTransactions = transactions.filter(t => t.status === 'completed').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NasabahSidebar />
        <div className="lg:ml-64">
          <main className="p-4 pt-16 lg:pt-8">
            <SkeletonLoader type="riwayat" />
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 pl-12 lg:pl-0">
                <History className="w-8 h-8 mr-3 text-bank-green-600" />
                Riwayat Transaksi
              </h1>
              <p className="text-gray-600 mt-1">Lihat semua aktivitas dan transaksi Anda</p>
            </div>

            <Button
              variant="outline"
              onClick={() => toast.info("Fitur Export", { description: "Akan segera tersedia" })}
              className="hover-scale"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Poin Earned</p>
                    <p className="text-2xl font-bold text-green-600">+{totalPoints.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transaksi Selesai</p>
                    <p className="text-2xl font-bold text-blue-600">{completedTransactions}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <History className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Menunggu Proses</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingTransactions}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter & Pencarian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Cari berdasarkan ID atau deskripsi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bank-green-500 focus:border-transparent"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="pickup">Penjemputan</option>
                    <option value="exchange">Tukar Poin</option>
                  </select>

                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="hover-scale"
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Transaksi ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Tidak ada transaksi</h3>
                  <p className="text-gray-500">Belum ada transaksi yang sesuai dengan filter Anda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => {
                    const TypeIcon = getTypeIcon(transaction.type);
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(transaction.type)}`}>
                            <TypeIcon className="w-6 h-6" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-800">{transaction.description}</h4>
                              <Badge className={getStatusColor(transaction.status)}>
                                {getStatusText(transaction.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {transaction.id} • {formatDate(transaction.date)}
                            </p>
                            {transaction.waste_type && (
                              <p className="text-sm text-gray-600">
                                {transaction.waste_type} • {transaction.weight} kg
                              </p>
                            )}
                            {transaction.reward_item && (
                              <p className="text-sm text-gray-600">
                                {transaction.reward_item}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()} Poin
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedTransaction(transaction); setOpenDetail(true); }}
                            className="mt-2 hover-scale"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-lg w-full">
          {selectedTransaction && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedTransaction.type) && (
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(selectedTransaction.type)}`}>
                      {React.createElement(getTypeIcon(selectedTransaction.type), { className: 'w-5 h-5' })}
                    </span>
                  )}
                  Detail Transaksi
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedTransaction.status)}>{getStatusText(selectedTransaction.status)}</Badge>
                  <span className="text-xs text-gray-400">{formatDate(selectedTransaction.date)}</span>
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-1">{selectedTransaction.description}</div>
                {selectedTransaction.type === 'pickup' && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span>Jenis Sampah: {selectedTransaction.waste_type || '-'}</span>
                      {selectedTransaction.weight && <span>• {selectedTransaction.weight} kg</span>}
                    </div>
                  </>
                )}
                {selectedTransaction.type === 'exchange' && selectedTransaction.reward_item && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-purple-500" />
                    <span>Reward: {selectedTransaction.reward_item}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-base font-bold mt-2">
                  <span className={selectedTransaction.points > 0 ? 'text-green-600' : 'text-red-600'}>
                    {selectedTransaction.points > 0 ? '+' : ''}{selectedTransaction.points.toLocaleString()} Poin
                  </span>
                </div>
              </div>
              <DialogClose asChild>
                <Button className="mt-6 w-full btn-primary">Tutup</Button>
              </DialogClose>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RiwayatTransaksi;
