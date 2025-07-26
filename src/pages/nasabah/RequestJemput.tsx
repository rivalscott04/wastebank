import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
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
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { wasteService } from '@/services/waste.service';
import api from '@/services/api';

interface WasteItem {
  id: string;
  type: string; // will store category_id as string
  estimated_weight: number;
  description: string;
  category?: { name: string };
}

interface PickupRequest {
  id: string;
  date: string;
  time_slot: string;
  address: string;
  phone: string;
  notes: string;
  waste_items: WasteItem[];
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'approved';
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

  const [pickupHistory, setPickupHistory] = useState<PickupRequest[]>([]);

  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);

  const timeSlots = [
    { value: 'morning', label: 'Pagi (08:00-12:00)' },
    { value: 'afternoon', label: 'Siang (12:00-16:00)' },
    { value: 'evening', label: 'Sore (16:00-20:00)' }
  ];

  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const statusMap: Record<string, string> = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    in_progress: 'Dalam Proses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    approved: 'Dikonfirmasi',
  };

  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [profileAddress, setProfileAddress] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
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
      try {
        const res = await api.get('/auth/me');
        setProfileAddress(res.data.address || '');
        setFormData(prev => ({
          ...prev,
          phone: res.data.phone || '',
          address: res.data.address || ''
        }));
      } catch (e) {
        toast.error('Gagal memuat profil');
      }
      // Fetch categories from backend
      try {
        const cats = await wasteService.getCategories();
        setCategories(cats);
      } catch (e) {
        toast.error('Gagal memuat kategori sampah');
      }
      setIsLoading(false);
    };
    loadData();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'history') {
      wasteService.getPickupRequests().then(res => {
        const data = (res.data || res).map((item: any) => ({
          id: item.id,
          date: item.pickup_date,
          time_slot: item.pickup_time_slot,
          address: item.pickup_address,
          phone: item.phone || item.user?.phone || '',
          notes: item.notes || '',
          waste_items: item.items?.map((i: any) => ({
            id: i.id,
            type: i.category?.name || '',
            estimated_weight: i.estimated_weight,
            description: '',
            category: i.category
          })) || [],
          status: item.status,
          created_at: item.createdAt
        }));
        setPickupHistory(data);
      });
    }
  }, [activeTab]);

  const addWasteItem = () => {
    const newItem: WasteItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      type: '',
      estimated_weight: 0,
      description: ''
    };
    setWasteItems(prev => {
      const updated = [...prev, newItem];
      console.log('After add:', updated);
      return updated;
    });
  };

  const removeWasteItem = (id: string) => {
    setWasteItems(prev => {
      const updated = prev.length > 1 ? prev.filter(item => item.id !== id) : prev;
      console.log('After remove:', updated);
      return updated;
    });
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
    console.log('Waste items to submit:', wasteItems);
    try {
      await wasteService.createPickupRequest({
        pickup_address: useProfileAddress ? profileAddress : formData.address,
        pickup_date: formData.date,
        pickup_time_slot: formData.time_slot,
        notes: formData.notes,
        items: wasteItems
          .filter(item => item.type && item.estimated_weight > 0)
          .map(item => ({
            category_id: Number(item.type),
            estimated_weight: item.estimated_weight
          }))
      });
      toast.success("Request Berhasil Dikirim!", {
        description: "Permintaan penjemputan Anda telah diterima dan sedang diproses"
      });
      setFormData({
        date: '',
        time_slot: '',
        address: '',
        phone: '',
        notes: ''
      });
      setWasteItems([{ id: '1', type: '', estimated_weight: 0, description: '' }]);
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

  // Helper untuk menggabungkan waste_items dengan kategori sama
  function groupWasteItems(items: WasteItem[]) {
    const grouped: Record<string, WasteItem> = {};
    for (const item of items) {
      const key = item.category?.name || item.type;
      if (!key) continue;
      if (!grouped[key]) {
        grouped[key] = { ...item, estimated_weight: Number(item.estimated_weight) || 0 };
      } else {
        grouped[key].estimated_weight += Number(item.estimated_weight) || 0;
      }
    }
    return Object.values(grouped);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar role="nasabah" />
        <div className="flex-1 lg:ml-0">
          <main className="p-4 lg:p-8">
            <SkeletonLoader type="request-jemput" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role="nasabah" />

      <div className="flex-1 lg:ml-0">
        <main className="p-4 lg:p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 pl-12 lg:pl-0">
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
                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        Alamat Penjemputan *
                      </Label>
                      <div className="flex items-center gap-4 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={useProfileAddress}
                            onChange={() => {
                              setUseProfileAddress(true);
                              setFormData(prev => ({ ...prev, address: profileAddress }));
                            }}
                          />
                          <span className="text-sm">Gunakan alamat profil</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!useProfileAddress}
                            onChange={() => {
                              setUseProfileAddress(false);
                              setFormData(prev => ({ ...prev, address: '' }));
                            }}
                          />
                          <span className="text-sm">Masukkan alamat lain</span>
                        </label>
                      </div>
                      <div className={`transition-all duration-300 ${useProfileAddress ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}> 
                        <div className="p-3 bg-gray-50 rounded-lg border text-gray-700">{profileAddress || '-'}</div>
                      </div>
                      <div className={`transition-all duration-300 ${!useProfileAddress ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}> 
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Masukkan alamat lengkap untuk penjemputan"
                          className="transition-all duration-200 focus:ring-2 focus:ring-bank-green-500"
                          rows={3}
                          required={!useProfileAddress}
                          disabled={useProfileAddress}
                        />
                      </div>
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
                                {categories.map(cat => {
                                  const isSelected = wasteItems.some(wi => wi.type === String(cat.id) && wi.id !== item.id);
                                  return (
                                    <option key={cat.id} value={cat.id} disabled={isSelected}>{cat.name}</option>
                                  );
                                })}
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
                        <span className="font-medium">
                          {formData.time_slot ? timeSlots.find(slot => slot.value === formData.time_slot)?.label || formData.time_slot : '-'}
                        </span>
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
                    <p className="text-gray-500">Ayo ajukan penjemputan sampah pertamamu!</p>
                    <Button onClick={() => setActiveTab('new')} className="mt-4 bg-bank-green-600 hover:bg-bank-green-700 text-white">Request Jemput Sekarang</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pickupHistory.map((request) => (
                      <div
                        key={request.id}
                        className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-2 border border-gray-100 hover:shadow-lg transition cursor-pointer group"
                        onClick={() => { setSelectedRequest(request); setShowDetail(true); }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {request.status === 'pending' && <Clock className="text-yellow-500 w-5 h-5" />}
                            {request.status === 'completed' && <CheckCircle className="text-green-500 w-5 h-5" />}
                            {request.status === 'cancelled' && <XCircle className="text-red-500 w-5 h-5" />}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>{statusMap[request.status] || request.status}</span>
                          </div>
                          <span className="text-gray-400 text-xs font-mono">#{request.id}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center text-sm text-gray-600 mb-1">
                          <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />
                            {request.date && !isNaN(new Date(request.date).getTime())
                              ? new Date(request.date).toLocaleDateString('id-ID')
                              : <span className="text-gray-400 italic">-</span>
                            }
                          </div>
                          {request.time_slot && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" /> 
                              {timeSlots.find(slot => slot.value === request.time_slot)?.label || request.time_slot}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 font-medium mb-1"><MapPin className="w-4 h-4 text-pink-500" />{request.address}</div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {/* Di list ringkasan */}
                          <span><b>{groupWasteItems(request.waste_items).length}</b> jenis: {groupWasteItems(request.waste_items).map(i => i.category?.name).filter(Boolean).join(', ') || '-'}</span>
                          <span><b>Total:</b> {groupWasteItems(request.waste_items).reduce((sum, i) => sum + (Number(i.estimated_weight) || 0), 0).toFixed(2)} kg</span>
                        </div>
                        {request.notes && (
                          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg mt-2">
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

      {showDetail && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowDetail(false)}
              aria-label="Tutup"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-bank-green-700 flex items-center gap-2">
              <Truck className="w-7 h-7 text-bank-green-600" />
              Detail Request Jemput
            </h2>
            <div className="mb-3 flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedRequest.status)}`}> 
                {statusMap[selectedRequest.status] || selectedRequest.status}
              </span>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">{formatDate(selectedRequest.date)}</span>
              {selectedRequest.time_slot && (
                <span className="ml-2 text-gray-500">
                  ({timeSlots.find(slot => slot.value === selectedRequest.time_slot)?.label || selectedRequest.time_slot})
                </span>
              )}
            </div>
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-pink-500" />
              <span>{selectedRequest.address}</span>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Phone className="w-5 h-5 text-indigo-500" />
              <span>{selectedRequest.phone}</span>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="font-semibold">Catatan:</span>
              <span className="text-gray-700">{selectedRequest.notes || '-'}</span>
            </div>
            <div className="mb-2">
              <div className="font-semibold mb-1 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />Jenis Sampah:
              </div>
              <ul className="ml-6 space-y-1">
                {groupWasteItems(selectedRequest.waste_items).map((item, idx) => (
                  <li key={item.category?.name || item.type} className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-bank-green-500"></span>
                    <span className="font-medium text-gray-800">{item.category?.name || 'Tanpa Nama'}</span>
                    <span className="text-gray-500">- {Number(item.estimated_weight).toFixed(2)} kg</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="px-6 py-2 bg-bank-green-600 text-white rounded-lg font-semibold shadow hover:bg-bank-green-700 transition"
                onClick={() => setShowDetail(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestJemput;
