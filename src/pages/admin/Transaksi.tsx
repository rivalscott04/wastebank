import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import SkeletonLoader from '@/components/SkeletonLoader';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  User,
  Calendar,
  Weight,
  DollarSign,
  Star,
  TrendingUp
} from 'lucide-react';
import { transactionService } from '@/services/transaction.service';
import Sidebar from '@/components/Sidebar';

interface Transaction {
  id: string;
  user_id: string;
  user_name: string;
  waste_id: string;
  waste_name: string;
  weight: number;
  total_price: number;
  total_points: number;
  date: string;
  created_at: string;
}

const Transaksi = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [deleteTransaction, setDeleteTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    user_name: '',
    waste_name: '',
    weight: '',
    total_price: '',
    total_points: '',
    date: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
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
      try {
        const apiData = await transactionService.getAllTransactions();
        
        // Mapping data dari API ke struktur tabel
        const mapped = apiData.map((trx: any) => ({
          id: trx.id,
          user_id: trx.user_id,
          user_name: trx.transactionUser?.name || '-',
          waste_id: trx.items?.[0]?.category_id || '-',
          waste_name: trx.items && trx.items.length > 0
            ? trx.items.map((i: any) => i.transactionCategory?.name).filter(Boolean).join(', ')
            : '-',
          weight: typeof trx.total_weight !== 'undefined' ? trx.total_weight : (trx.items?.reduce((sum: number, i: any) => sum + Number(i.weight || 0), 0)),
          total_price: trx.total_amount,
          total_points: trx.total_points,
          date: trx.createdAt,
          created_at: trx.createdAt
        }));
        setTransactions(mapped);
      } catch (e) {
        toast.error('Gagal memuat data transaksi');
      }
      setIsLoading(false);
    };
    loadData();
  }, [navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const openAddDialog = () => {
    setFormData({
      user_name: '',
      waste_name: '',
      weight: '',
      total_price: '',
      total_points: '',
      date: ''
    });
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      user_name: transaction.user_name,
      waste_name: transaction.waste_name,
      weight: transaction.weight.toString(),
      total_price: transaction.total_price.toString(),
      total_points: transaction.total_points.toString(),
      date: transaction.date
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTransaction) {
      // Update existing transaction
      const updatedTransaction: Transaction = {
        ...selectedTransaction,
        user_name: formData.user_name,
        waste_name: formData.waste_name,
        weight: parseFloat(formData.weight),
        total_price: parseFloat(formData.total_price),
        total_points: parseInt(formData.total_points),
        date: formData.date
      };

      setTransactions(prev =>
        prev.map(t => t.id === selectedTransaction.id ? updatedTransaction : t)
      );
      toast.success("Transaksi berhasil diperbarui!", {
        description: `Transaksi ${formData.user_name} telah diperbaharui`,
      });
      setIsEditDialogOpen(false);
    } else {
      // Add new transaction
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        user_id: Date.now().toString(),
        user_name: formData.user_name,
        waste_id: Date.now().toString(),
        waste_name: formData.waste_name,
        weight: parseFloat(formData.weight),
        total_price: parseFloat(formData.total_price),
        total_points: parseInt(formData.total_points),
        date: formData.date,
        created_at: new Date().toISOString()
      };

      setTransactions(prev => [...prev, newTransaction]);
      toast.success("Transaksi baru berhasil ditambahkan!", {
        description: `Transaksi ${formData.user_name} telah terdaftar`,
      });
      setIsAddDialogOpen(false);
    }

    setSelectedTransaction(null);
  };

  const handleDelete = (transaction: Transaction) => {
    setDeleteTransaction(transaction);
  };

  const confirmDelete = () => {
    if (deleteTransaction) {
      setTransactions(prev => prev.filter(t => t.id !== deleteTransaction.id));
      toast.success("Transaksi berhasil dihapus!", {
        description: `Transaksi ${deleteTransaction.user_name} telah dihapus dari sistem`,
      });
      setDeleteTransaction(null);
    }
  };

  // Stats calculation
  const stats = {
    total: transactions.length,
    totalRevenue: transactions.reduce((sum, t) => sum + (Number(t.total_price) || 0), 0),
    totalWeight: transactions.reduce((sum, t) => sum + (Number(t.weight) || 0), 0),
    totalPoints: transactions.reduce((sum, t) => sum + (Number(t.total_points) || 0), 0),
    avgTransaction: transactions.length > 0 ? transactions.reduce((sum, t) => sum + (Number(t.total_price) || 0), 0) / transactions.length : 0
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar role="admin" />
        <div className="flex-1 lg:ml-0 p-4 lg:p-8">
          <SkeletonLoader type="table" />
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
        <main className="p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-2 pl-12 lg:pl-0">
              <ShoppingCart className="w-6 h-6 mr-3 text-bank-green-600" />
              Kelola Transaksi
            </h1>
            <p className="text-gray-600">
              Kelola semua transaksi penjualan sampah
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Transaksi</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-bank-green-100 to-bank-green-200 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-bank-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Berat</p>
                    <p className="text-2xl font-bold text-blue-600">{(Number(stats.totalWeight) || 0).toFixed(1)} Kg</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <Weight className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Poin</p>
                    <p className="text-2xl font-bold text-purple-600">{(Number(stats.totalPoints) || 0).toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Rata-rata</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.avgTransaction)}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Table */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-bank-green-50 to-bank-blue-50 rounded-t-lg border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-bank-green-500 to-bank-green-600 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    Daftar Transaksi
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    Kelola transaksi penjualan sampah dan pembayaran
                  </CardDescription>
                </div>
                <button onClick={openAddDialog} className="btn-add group">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Tambah Transaksi
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">Nasabah</TableHead>
                    <TableHead className="font-semibold text-gray-700">Jenis Sampah</TableHead>
                    <TableHead className="font-semibold text-gray-700">Berat</TableHead>
                    <TableHead className="font-semibold text-gray-700">Total Harga</TableHead>
                    <TableHead className="font-semibold text-gray-700">Poin</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {transaction.user_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{transaction.waste_name}</TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Weight className="w-4 h-4 text-gray-400" />
                          {transaction.weight} Kg
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(transaction.total_price)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 flex items-center gap-1 w-fit">
                          <Star className="w-3 h-3" />
                          {transaction.total_points}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {transaction.date && !isNaN(new Date(transaction.date).getTime())
                            ? new Date(transaction.date).toLocaleDateString('id-ID')
                            : <span className="text-gray-400 italic">-</span>
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <button
                            className="btn-edit group flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                            onClick={() => openEditDialog(transaction)}
                            title="Edit Transaksi"
                          >
                            <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            Edit
                          </button>
                          <button
                            className="btn-delete group flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                            onClick={() => handleDelete(transaction)}
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            Hapus
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid md:hidden gap-4 mt-4">
            {transactions.map(transaction => (
              <div key={transaction.id} className="w-full max-w-full bg-white rounded-xl shadow px-3 py-4 flex flex-col gap-2 border border-bank-green-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bank-green-100 flex items-center justify-center font-bold text-bank-green-700 text-lg">{transaction.user_name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-bank-green-700 text-base break-words">{transaction.user_name}</div>
                    <div className="text-xs text-gray-400">Transaksi</div>
                  </div>
                  <div className="font-bold text-purple-700 whitespace-nowrap">{transaction.total_points} poin</div>
                </div>
                <div className="flex flex-col gap-1 mt-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500 break-words"><Star className="w-4 h-4" /> {transaction.waste_name}</div>
                  <div className="flex items-center gap-2 text-gray-500 break-words"><Weight className="w-4 h-4" /> {transaction.weight} Kg</div>
                  <div className="flex items-center gap-2 text-gray-500 break-words"><DollarSign className="w-4 h-4" /> {formatCurrency(transaction.total_price)}</div>
                  <div className="flex items-center gap-2 text-gray-500 break-words"><Calendar className="w-4 h-4" /> {transaction.date && !isNaN(new Date(transaction.date).getTime()) ? new Date(transaction.date).toLocaleDateString('id-ID') : <span className="text-gray-400 italic">-</span>}</div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button type="button" size="sm" variant="outline" className="border-bank-green-200 text-bank-green-700 hover:bg-bank-green-100 hover:text-bank-green-900 flex flex-row items-center gap-1 flex-1 w-full" onClick={() => openEditDialog(transaction)}><Edit className="mr-1 w-4 h-4" /> Edit</Button>
                  <Button type="button" size="sm" variant="destructive" className="hover:bg-red-100 hover:text-red-800 flex flex-row items-center gap-1 flex-1 w-full" onClick={() => handleDelete(transaction)}><Trash2 className="mr-1 w-4 h-4" /> Hapus</Button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-bank-green-600" />
              Tambah Transaksi
            </DialogTitle>
            <DialogDescription>
              Tambahkan transaksi penjualan sampah baru
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user_name">Nama Nasabah</Label>
                <Input
                  id="user_name"
                  value={formData.user_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="waste_name">Jenis Sampah</Label>
                <Input
                  id="waste_name"
                  value={formData.waste_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, waste_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Berat (Kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="total_price">Total Harga (Rp)</Label>
                <Input
                  id="total_price"
                  type="number"
                  value={formData.total_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_price: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_points">Total Poin</Label>
                <Input
                  id="total_points"
                  type="number"
                  value={formData.total_points}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_points: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Tanggal Transaksi</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="btn-primary">
                Tambah Transaksi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Transaksi
            </DialogTitle>
            <DialogDescription>
              Perbarui informasi transaksi
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_user_name">Nama Nasabah</Label>
                <Input
                  id="edit_user_name"
                  value={formData.user_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_waste_name">Jenis Sampah</Label>
                <Input
                  id="edit_waste_name"
                  value={formData.waste_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, waste_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_weight">Berat (Kg)</Label>
                <Input
                  id="edit_weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_total_price">Total Harga (Rp)</Label>
                <Input
                  id="edit_total_price"
                  type="number"
                  value={formData.total_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_price: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_total_points">Total Poin</Label>
                <Input
                  id="edit_total_points"
                  type="number"
                  value={formData.total_points}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_points: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_date">Tanggal Transaksi</Label>
                <Input
                  id="edit_date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="btn-primary">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTransaction}
        onClose={() => setDeleteTransaction(null)}
        onConfirm={confirmDelete}
        title="Hapus Transaksi"
        description={`Apakah Anda yakin ingin menghapus transaksi ${deleteTransaction?.user_name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default Transaksi;
