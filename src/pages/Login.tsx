import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Recycle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth.service';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      console.log('Login response:', response);

      // Simpan token dan user data ke localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      console.log('Token saved:', localStorage.getItem('token'));
      console.log('User saved:', localStorage.getItem('user'));

      toast({
        title: "Login berhasil!",
        description: `Selamat datang, ${response.user.name}!`,
      });

      console.log('Redirecting to:', response.user.role === 'admin' ? '/admin/dashboard' : '/nasabah/dashboard');

      // Redirect berdasarkan role dengan delay kecil
      setTimeout(() => {
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/nasabah/dashboard');
        }
      }, 100);
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login gagal!",
        description: error.response?.data?.message || "Terjadi kesalahan saat login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bank-green-50 to-bank-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Button>

        <Card className="w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm animate-bounce-in">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-green rounded-2xl flex items-center justify-center">
              <Recycle className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">Masuk ke Akun</CardTitle>
              <CardDescription className="text-gray-600">
                Masuk untuk mengakses Bank Sampah Digital
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="masukkan@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full transition-all duration-200 focus:ring-2 focus:ring-bank-green-500"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pr-10 transition-all duration-200 focus:ring-2 focus:ring-bank-green-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, rememberMe: !!checked }))
                  }
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Ingat saya
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-base font-medium"
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">atau</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-bank-green-600 hover:text-bank-green-700 font-medium hover:underline transition-colors"
                >
                  Daftar di sini
                </button>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1 text-gray-700">🧪 Demo Credentials (Password: password123):</p>
              <div className="space-y-2 mt-2">
                <div className="border-l-2 border-blue-500 pl-2">
                  <p className="font-medium text-blue-700">👨‍💼 Admin Panel</p>
                  <p>admin@wastebank.com</p>
                  <p className="text-xs text-gray-400">• Kelola nasabah, kategori, transaksi</p>
                  <p className="text-xs text-gray-400">• Update status penjemputan</p>
                </div>
                <div className="border-l-2 border-green-500 pl-2">
                  <p className="font-medium text-green-700">👩 Nasabah 1 (Siti Rahayu)</p>
                  <p>siti@example.com</p>
                  <p className="text-xs text-gray-400">• 268 poin, 1 transaksi selesai</p>
                  <p className="text-xs text-gray-400">• Ada riwayat penjemputan (completed)</p>
                </div>
                <div className="border-l-2 border-orange-500 pl-2">
                  <p className="font-medium text-orange-700">👨 Nasabah 2 (Budi Santoso)</p>
                  <p>budi@example.com</p>
                  <p className="text-xs text-gray-400">• 0 poin, belum ada transaksi</p>
                  <p className="text-xs text-gray-400">• Siap untuk testing request jemput baru</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;