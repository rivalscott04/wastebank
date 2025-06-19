import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import NasabahSidebar from '@/components/NasabahSidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Star,
  Award
} from 'lucide-react';
import api from '@/services/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  profile_picture?: string;
  created_at: string;
  total_points: number;
  rank: string;
  total_transactions: number;
  total_waste_collected: number;
}

const ProfilNasabah = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: 'male',
    profile_picture: '',
    created_at: '',
    total_points: 0,
    rank: 'Bronze',
    total_transactions: 0,
    total_waste_collected: 0
  });

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: 'male' as 'male' | 'female'
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      // Check if user is logged in and is nasabah
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/login');
        return;
      }
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'nasabah') {
        toast.error("Akses Ditolak", { description: "Anda tidak memiliki akses ke halaman nasabah" });
        navigate('/');
        return;
      }
      try {
        const res = await api.get('/auth/me');
        const data = res.data;
        setProfile({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || 'male',
          profile_picture: data.profile_picture || '',
          created_at: data.createdAt || '',
          total_points: data.points || 0,
          rank: data.rank || 'Bronze',
          total_transactions: data.total_transactions || 0,
          total_waste_collected: data.total_waste_collected || 0
        });
        setEditForm({
          name: data.name,
          phone: data.phone || '',
          address: data.address || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || 'male'
        });
        setUser(parsedUser);
      } catch (error) {
        toast.error('Gagal memuat profil', { description: 'Terjadi kesalahan saat mengambil data profil' });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditForm({
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
      date_of_birth: profile.date_of_birth,
      gender: profile.gender
    });
    setIsEditing(false);
  };

  const handleSave = () => {
    setShowConfirmDialog(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    setShowConfirmDialog(false);
    try {
      const res = await api.put(`/users/${profile.id}`, {
        name: editForm.name,
        phone: editForm.phone,
        address: editForm.address
      });
      const updated = res.data.user;
      setProfile(prev => ({ ...prev, ...updated }));
      setIsEditing(false);
      toast.success("Profil berhasil diperbarui!", { description: "Informasi profil Anda telah disimpan" });
    } catch (error) {
      toast.error("Gagal memperbarui profil", { description: "Terjadi kesalahan saat menyimpan data" });
    } finally {
      setIsSaving(false);
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <NasabahSidebar />
        <div className="flex-1 ml-0 lg:ml-64 p-8 pt-16 lg:pt-8">
          <SkeletonLoader type="profile" />
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
        <main className="p-4 pt-16 lg:p-8 lg:pt-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
              <User className="w-6 h-6 mr-3 text-bank-green-600" />
              Profil Saya
            </h2>
            <p className="text-gray-600">
              Kelola informasi profil dan data pribadi Anda
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="bg-gradient-to-r from-bank-green-50 to-bank-blue-50 rounded-t-lg border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-bank-green-500 to-bank-green-600 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        Informasi Profil
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-2">
                        Data pribadi dan informasi akun Anda
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button onClick={handleEdit} className="btn-primary group">
                        <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                        Edit Profil
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          disabled={isSaving}
                          className="group"
                        >
                          <X className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                          Batal
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="btn-primary group"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                              Simpan
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-r from-bank-green-500 to-bank-green-600 rounded-full flex items-center justify-center">
                          {profile.profile_picture ? (
                            <img
                              src={profile.profile_picture}
                              alt="Profile"
                              className="w-24 h-24 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-12 h-12 text-white" />
                          )}
                        </div>
                        {isEditing && (
                          <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Camera className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{profile.name}</h3>
                        <p className="text-gray-600">{profile.email}</p>
                        <Badge className={`mt-2 ${getRankColor(profile.rank)}`}>
                          <Award className="w-3 h-3 mr-1" />
                          {profile.rank}
                        </Badge>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          Nama Lengkap
                        </Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="transition-all duration-200 focus:ring-2 focus:ring-bank-green-500"
                            required
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            {profile.name}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          Email
                        </Label>
                        <div className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                          <span>{profile.email}</span>
                          <Shield className="w-4 h-4 text-green-600" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          Nomor Telepon
                        </Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="transition-all duration-200 focus:ring-2 focus:ring-bank-green-500"
                            required
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            {profile.phone}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="date_of_birth" className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          Tanggal Lahir
                        </Label>
                        {isEditing ? (
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={editForm.date_of_birth}
                            onChange={(e) => setEditForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
                            className="transition-all duration-200 focus:ring-2 focus:ring-bank-green-500"
                            required
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            {formatDate(profile.date_of_birth)}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          Alamat
                        </Label>
                        {isEditing ? (
                          <Textarea
                            id="address"
                            value={editForm.address}
                            onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                            className="transition-all duration-200 focus:ring-2 focus:ring-bank-green-500"
                            rows={3}
                            required
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            {profile.address}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="gender" className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          Jenis Kelamin
                        </Label>
                        {isEditing ? (
                          <select
                            id="gender"
                            value={editForm.gender}
                            onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                            className="w-full p-3 border border-gray-300 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-bank-green-500 focus:border-transparent"
                          >
                            <option value="male">Laki-laki</option>
                            <option value="female">Perempuan</option>
                          </select>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            {profile.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          Bergabung Sejak
                        </Label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          {profile.created_at && !isNaN(new Date(profile.created_at).getTime())
                            ? new Date(profile.created_at).toLocaleDateString('id-ID')
                            : <span className="text-gray-400 italic">-</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats & Info */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-600" />
                    Statistik Saya
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="text-sm font-medium text-green-800">Total Poin</p>
                        <p className="text-xl font-bold text-green-600">{profile.total_points.toLocaleString()}</p>
                      </div>
                      <Star className="w-8 h-8 text-green-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Total Transaksi</p>
                        <p className="text-xl font-bold text-blue-600">{profile.total_transactions}</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{profile.total_transactions}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div>
                        <p className="text-sm font-medium text-purple-800">Sampah Terkumpul</p>
                        <p className="text-xl font-bold text-purple-600">{profile.total_waste_collected} Kg</p>
                      </div>
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-xs">Kg</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    Keamanan Akun
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Email Terverifikasi</p>
                          <p className="text-sm text-gray-500">Akun Anda aman</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        ✓ Aktif
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Nomor Telepon</p>
                          <p className="text-sm text-gray-500">Terdaftar dan aktif</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        ✓ Aktif
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start hover-scale"
                      onClick={() => toast.info("Fitur Ubah Password", { description: "Akan segera tersedia" })}
                    >
                      <Shield className="w-4 h-4 mr-3 text-gray-600" />
                      Ubah Password
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start hover-scale"
                      onClick={() => toast.info("Fitur Riwayat Aktivitas", { description: "Akan segera tersedia" })}
                    >
                      <Calendar className="w-4 h-4 mr-3 text-gray-600" />
                      Riwayat Aktivitas
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start hover-scale"
                      onClick={() => toast.info("Fitur Pengaturan Notifikasi", { description: "Akan segera tersedia" })}
                    >
                      <Mail className="w-4 h-4 mr-3 text-gray-600" />
                      Pengaturan Notifikasi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Confirm Save Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmSave}
        title="Simpan Perubahan Profil"
        description="Apakah Anda yakin ingin menyimpan perubahan pada profil Anda? Pastikan semua informasi sudah benar."
        confirmText="Simpan"
        cancelText="Batal"
        type="success"
      />
    </div>
  );
};

export default ProfilNasabah;
