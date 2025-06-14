import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NasabahSidebar from '@/components/NasabahSidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  Phone,
  User,
  Package,
  Plus,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WasteItem {
  id: string;
  type: string;
  estimated_weight: number;
  description: string;
}

interface PickupRequest {
  id: string;
  date: string;
  time_slot: string;
  address: string;
  phone: string;
  notes: string;
  waste_items: WasteItem[];
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

const RequestJemput = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  // Form state
  const [formData, setFormData] = useState({
    date: '',
    time_slot: '',
    address: '',
    phone: '',
    notes: ''
  });

  const [wasteItems, setWasteItems] = useState<WasteItem[]>([
    { id: '1', type: '', estimated_weight: 0, description: '' }
  ]);

  // Mock existing requests
  const [pickupHistory] = useState<PickupRequest[]>([
    {
      id: 'REQ001',
      date: '2024-06-15',
      time_slot: '09:00-12:00',
      address: 'Jl. Merdeka No. 123, Jakarta Pusat',
      phone: '081234567890',
      notes: 'Sampah di depan rumah',
      waste_items: [
        { id: '1', type: 'Plastik', estimated_weight: 5, description: 'Botol plastik bekas' }
      ],
      status: 'pending',
      created_at: '2024-06-14'
    }
  ]);

  const wasteTypes = [
    'Plastik',
    'Kertas',
    'Logam',
    'Kaca',
    'Elektronik',
    'Organik'
  ];

  const timeSlots = [
    '08:00-11:00',
    '09:00-12:00',
    '13:00-16:00',
    '14:00-17:00'
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

      // Pre-fill user data
      setFormData(prev => ({
        ...prev,
        phone: userData.phone || '',
        address: userData.address || ''
      }));

      setIsLoading(false);
    };

    loadData();
  }, [navigate]);

  const addWasteItem = () => {
    const newItem: WasteItem = {
      id: Date.now().toString(),
      type: '',
      estimated_weight: 0,
      description: ''
    };
    setWasteItems([...wasteItems, newItem]);
  };

  const removeWasteItem = (id: string) => {
    if (wasteItems.length > 1) {
      setWasteItems(wasteItems.filter(item => item.id !== id));
    }
  };

  const updateWasteItem = (id: string, field: keyof WasteItem, value: any) => {
    setWasteItems(wasteItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const validateForm = () => {
    if (!formData.date || !formData.time_slot || !formData.address || !formData.phone) {
      toast.error("Form Tidak Lengkap", { description: "Mohon lengkapi semua field yang wajib diisi" });
      return false;
    }

    const validWasteItems = wasteItems.filter(item =>
      item.type && item.estimated_weight > 0
    );

    if (validWasteItems.length === 0) {
      toast.error("Sampah Tidak Valid", { description: "Minimal harus ada 1 jenis sampah dengan berat > 0" });
      return false;
    }

    // Check if pickup date is not in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Tanggal Tidak Valid", { description: "Tanggal penjemputan tidak boleh di masa lalu" });
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmDialog(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would make the actual API call
      const newRequest: PickupRequest = {
        id: `REQ${Date.now()}`,
        date: formData.date,
        time_slot: formData.time_slot,
        address: formData.address,
        phone: formData.phone,
        notes: formData.notes,
        waste_items: wasteItems.filter(item => item.type && item.estimated_weight > 0),
        status: 'pending',
        created_at: new Date().toISOString()
      };

      toast.success("Request Berhasil Dikirim!", {
        description: "Permintaan penjemputan Anda telah diterima dan sedang diproses"
      });

      // Reset form
      setFormData({
        date: '',
        time_slot: '',
        address: '',
        phone: '',
        notes: ''
      });
      setWasteItems([{ id: '1', type: '', estimated_weight: 0, description: '' }]);

      // Switch to history tab
      setActiveTab('history');

    } catch (error) {
      toast.error("Gagal Mengirim Request", {
        description: "Terjadi kesalahan saat mengirim permintaan. Silakan coba lagi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'in_progress':
        return 'Dalam Proses';
      case 'completed':
        return 'Selesai';
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
            <SkeletonLoader type="request-jemput" />
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
              <Truck className="w-8 h-8 mr-3 text-bank-green-600" />
              Request Jemput Sampah
            </h1>
            <p className="text-gray-600 mt-1">Ajukan permintaan penjemputan sampah ke lokasi Anda</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'new'
                  ? 'bg-white text-bank-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Request Baru
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-bank-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Riwayat Request
            </button>
          </div>

          {activeTab === 'new' ? (
            /* New Request Form */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      Informasi Penjemputan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          Tanggal Penjemputan *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="transition-all duration-200 focus:ring-2 focus:ring-bank-green-500"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="time_slot" className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          Waktu Penjemputan *
                        </Label>
                        <select
                          id="time_slot"
                          value={formData.time_slot}
                          onChange={(e) => setFormData(prev => ({ ...prev, time_slot: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-bank-green-500 focus:border-transparent"
                          required
                        >
                          <option value="">Pilih waktu</option>
                          {timeSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        Alamat Penjemputan *
                      </Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Masukkan alamat lengkap untuk penjemputan"
                        className="transition-all duration-200 focus:ring-2 focus:ring-bank-green-500"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        Nomor Telepon *
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Nomor telepon yang bisa dihubungi"
                        className="transition-all duration-200 focus:ring-2 focus:ring-bank-green-500"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes" className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        Catatan Tambahan
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Catatan khusus untuk petugas (opsional)"
                        className="transition-all duration-200 focus:ring-2 focus:ring-bank-green-500"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Waste Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 mr-2 text-green-600" />
                        Jenis Sampah
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addWasteItem}
                        className="hover-scale"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {wasteItems.map((item, index) => (
                        <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-800">Sampah #{index + 1}</h4>
                            {wasteItems.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeWasteItem(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                Jenis Sampah *
                              </Label>
                              <select
                                value={item.type}
                                onChange={(e) => updateWasteItem(item.id, 'type', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-bank-green-500 focus:border-transparent"
                                required
                              >
                                <option value="">Pilih jenis</option>
                                {wasteTypes.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                                Perkiraan Berat (kg) *
                              </Label>
                              <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={item.estimated_weight || ''}
                                onChange={(e) => updateWasteItem(item.id, 'estimated_weight', parseFloat(e.target.value) || 0)}
                                placeholder="0.0"
                                className="text-sm"
                                required
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <Label className="text-sm font-medium text-gray-700 mb-1 block">
                              Deskripsi
                            </Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateWasteItem(item.id, 'description', e.target.value)}
                              placeholder="Deskripsi singkat sampah (opsional)"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <div>
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      Ringkasan Request
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal:</span>
                        <span className="font-medium">
                          {formData.date ? formatDate(formData.date) : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Waktu:</span>
                        <span className="font-medium">{formData.time_slot || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Jenis:</span>
                        <span className="font-medium">
                          {wasteItems.filter(item => item.type).length} jenis
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Berat:</span>
                        <span className="font-medium">
                          {wasteItems.reduce((sum, item) => sum + (item.estimated_weight || 0), 0).toFixed(1)} kg
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-bank-green-600 hover:bg-bank-green-700 text-white hover-scale"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Truck className="w-4 h-4 mr-2" />
                            Kirim Request
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                      <strong>Catatan:</strong> Setelah request dikirim, status akan menjadi "Menunggu" dan tim kami akan menghubungi Anda untuk konfirmasi.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* History Tab */
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Request Penjemputan</CardTitle>
              </CardHeader>
              <CardContent>
                {pickupHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada request</h3>
                    <p className="text-gray-500">Anda belum pernah mengajukan request penjemputan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pickupHistory.map((request) => (
                      <div
                        key={request.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-800">{request.id}</h4>
                              <Badge className={getStatusColor(request.status)}>
                                {getStatusText(request.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {formatDate(request.date)} • {request.time_slot}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info("Detail Request", { description: "Akan segera tersedia" })}
                            className="hover-scale"
                          >
                            Detail
                          </Button>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{request.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{request.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {request.waste_items.length} jenis sampah •
                              {request.waste_items.reduce((sum, item) => sum + item.estimated_weight, 0)} kg
                            </span>
                          </div>
                        </div>

                        {request.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                            <strong>Catatan:</strong> {request.notes}
                          </div>
                        )}
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
        onConfirm={confirmSubmit}
        title="Konfirmasi Request Penjemputan"
        description="Apakah Anda yakin ingin mengirim request penjemputan ini? Pastikan semua informasi sudah benar."
        confirmText="Kirim Request"
        cancelText="Batal"
        type="success"
      />
    </div>
  );
};

export default RequestJemput;
