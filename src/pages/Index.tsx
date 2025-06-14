import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recycle, Leaf, TrendingUp, Users, MapPin, Phone, Mail, Menu, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    toast({
      title: "Selamat Datang!",
      description: "Silakan login atau daftar untuk memulai",
    });
    navigate('/login');
  };

  const stats = [
    { icon: Users, label: 'Nasabah Aktif', value: '2,500+', color: 'text-bank-blue-500' },
    { icon: Recycle, label: 'Sampah Terkumpul', value: '15 Ton', color: 'text-bank-green-600' },
    { icon: TrendingUp, label: 'Poin Dibagikan', value: '50,000+', color: 'text-purple-500' },
    { icon: Leaf, label: 'CO₂ Dikurangi', value: '8.2 Ton', color: 'text-emerald-500' },
  ];

  const features = [
    {
      icon: Recycle,
      title: 'Tukar Sampah Jadi Poin',
      description: 'Kumpulkan sampah daur ulang dan tukarkan dengan poin reward yang bisa digunakan untuk berbagai kebutuhan.',
    },
    {
      icon: MapPin,
      title: 'Jemput Sampah',
      description: 'Layanan jemput sampah langsung ke rumah Anda dengan jadwal yang fleksibel dan mudah.',
    },
    {
      icon: TrendingUp,
      title: 'Tracking Real-time',
      description: 'Pantau perkembangan sampah yang sudah dikumpulkan dan poin yang sudah didapatkan secara real-time.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bank-green-50 to-bank-blue-50">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-green rounded-xl flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Bank Sampah Digital</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-bank-green-600 transition-colors">Beranda</a>
            <a href="#features" className="text-gray-700 hover:text-bank-green-600 transition-colors">Fitur</a>
            <a href="#about" className="text-gray-700 hover:text-bank-green-600 transition-colors">Tentang</a>
            <a href="#contact" className="text-gray-700 hover:text-bank-green-600 transition-colors">Kontak</a>
            <Button onClick={() => navigate('/login')} className="btn-primary">
              Masuk
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg animate-slide-in-right">
            <div className="p-4 space-y-4">
              <a href="#home" className="block text-gray-700 hover:text-bank-green-600 transition-colors">Beranda</a>
              <a href="#features" className="block text-gray-700 hover:text-bank-green-600 transition-colors">Fitur</a>
              <a href="#about" className="block text-gray-700 hover:text-bank-green-600 transition-colors">Tentang</a>
              <a href="#contact" className="block text-gray-700 hover:text-bank-green-600 transition-colors">Kontak</a>
              <Button onClick={() => navigate('/login')} className="w-full btn-primary">
                Masuk
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <Badge className="mb-6 bg-bank-green-100 text-bank-green-800 hover:bg-bank-green-200">
              🌱 Platform Digital Ramah Lingkungan
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Tukar Sampah Jadi
              <span className="bg-gradient-to-r from-bank-green-600 to-bank-blue-600 bg-clip-text text-transparent"> Berkah</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Platform digital yang memudahkan Anda mengumpulkan sampah daur ulang dan menukarkannya dengan poin reward. 
              Mari bersama-sama menjaga lingkungan!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleGetStarted} className="btn-primary text-lg px-8 py-3 smooth-bounce">
                Mulai Sekarang
              </Button>
              <Button onClick={() => navigate('/register')} className="btn-secondary text-lg px-8 py-3">
                Daftar Gratis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center hover-scale">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-bank-blue-100 text-bank-blue-800">Fitur Unggulan</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Kenapa Pilih Bank Sampah Digital?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami menyediakan solusi lengkap untuk pengelolaan sampah yang mudah, efisien, dan menguntungkan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-scale border-0 shadow-lg glass-effect">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 gradient-green rounded-2xl flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-bank-green-100 text-bank-green-800">Tentang Kami</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Bersama Membangun Masa Depan yang Berkelanjutan
              </h2>
              <p className="text-gray-600 mb-6">
                Bank Sampah Digital adalah platform inovatif yang menghubungkan komunitas dengan sistem pengelolaan sampah yang efisien. 
                Kami percaya bahwa setiap sampah memiliki nilai dan dapat diubah menjadi sesuatu yang bermanfaat.
              </p>
              <p className="text-gray-600 mb-8">
                Dengan teknologi modern dan pendekatan yang user-friendly, kami memudahkan masyarakat untuk berpartisipasi 
                dalam gerakan lingkungan sambil mendapatkan keuntungan ekonomis.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-bank-green-600 flex items-center justify-center">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </div>
                  <span className="text-gray-700">Proses yang mudah dan transparan</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-bank-green-600 flex items-center justify-center">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </div>
                  <span className="text-gray-700">Reward yang menarik dan berguna</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-bank-green-600 flex items-center justify-center">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </div>
                  <span className="text-gray-700">Dampak positif untuk lingkungan</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 flex items-center justify-center">
                <svg
                  viewBox="0 0 400 300"
                  className="w-full h-full max-w-md"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background Circle */}
                  <circle cx="200" cy="150" r="140" fill="#f0fdf4" opacity="0.8"/>
                  
                  {/* Recycling Symbol in Center */}
                  <g transform="translate(200,150)">
                    <circle cx="0" cy="0" r="35" fill="#22c55e" opacity="0.1"/>
                    <path
                      d="M-15 -8 L15 -8 L8 -20 M15 -8 L0 17 L-12 5 M0 17 L-15 -8 L-3 -16"
                      stroke="#16a34a"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  
                  {/* Waste Bins */}
                  <g transform="translate(120,200)">
                    <rect x="-15" y="-20" width="30" height="35" rx="3" fill="#3b82f6"/>
                    <rect x="-12" y="-17" width="24" height="3" fill="#2563eb"/>
                    <text x="0" y="0" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">♻</text>
                  </g>
                  
                  <g transform="translate(280,200)">
                    <rect x="-15" y="-20" width="30" height="35" rx="3" fill="#16a34a"/>
                    <rect x="-12" y="-17" width="24" height="3" fill="#15803d"/>
                    <text x="0" y="0" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">🗑</text>
                  </g>
                  
                  {/* Digital Elements */}
                  <g transform="translate(80,80)">
                    <rect x="-20" y="-15" width="40" height="25" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
                    <circle cx="0" cy="-2" r="3" fill="#22c55e"/>
                    <rect x="-8" y="5" width="16" height="2" fill="#e2e8f0"/>
                    <rect x="-6" y="8" width="12" height="1" fill="#e2e8f0"/>
                  </g>
                  
                  <g transform="translate(320,80)">
                    <rect x="-20" y="-15" width="40" height="25" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
                    <circle cx="0" cy="-2" r="3" fill="#3b82f6"/>
                    <rect x="-8" y="5" width="16" height="2" fill="#e2e8f0"/>
                    <rect x="-6" y="8" width="12" height="1" fill="#e2e8f0"/>
                  </g>
                  
                  {/* Connection Lines */}
                  <path
                    d="M100 85 Q150 60 180 120"
                    stroke="#22c55e"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                  
                  <path
                    d="M300 85 Q250 60 220 120"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                  
                  {/* Floating Elements */}
                  <circle cx="60" cy="120" r="4" fill="#22c55e" opacity="0.7">
                    <animate attributeName="cy" values="115;125;115" dur="3s" repeatCount="indefinite"/>
                  </circle>
                  
                  <circle cx="340" cy="140" r="3" fill="#3b82f6" opacity="0.7">
                    <animate attributeName="cy" values="135;145;135" dur="2.5s" repeatCount="indefinite"/>
                  </circle>
                  
                  <circle cx="80" cy="180" r="2" fill="#16a34a" opacity="0.5">
                    <animate attributeName="cy" values="175;185;175" dur="4s" repeatCount="indefinite"/>
                  </circle>
                  
                  {/* Money/Reward Symbol */}
                  <g transform="translate(200,60)">
                    <circle cx="0" cy="0" r="12" fill="#fbbf24" opacity="0.2"/>
                    <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#f59e0b" fontWeight="bold">₹</text>
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-bank-blue-100 text-bank-blue-800">Hubungi Kami</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Ada Pertanyaan? Kami Siap Membantu
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tim customer service kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover-scale border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-bank-green-100 rounded-2xl flex items-center justify-center">
                  <Phone className="w-8 h-8 text-bank-green-600" />
                </div>
                <CardTitle>Telepon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">Hubungi kami langsung</p>
                <p className="font-semibold text-bank-green-600">+62 812 3456 7890</p>
              </CardContent>
            </Card>

            <Card className="text-center hover-scale border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-bank-blue-100 rounded-2xl flex items-center justify-center">
                  <Mail className="w-8 h-8 text-bank-blue-600" />
                </div>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">Kirim email ke kami</p>
                <p className="font-semibold text-bank-blue-600">info@banksampah.digital</p>
              </CardContent>
            </Card>

            <Card className="text-center hover-scale border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>Lokasi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">Kunjungi kantor kami</p>
                <p className="font-semibold text-purple-600">Jakarta, Indonesia</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-green rounded-xl flex items-center justify-center">
                  <Recycle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Bank Sampah Digital</span>
              </div>
              <p className="text-gray-400">
                Platform digital untuk mengelola sampah dengan cara yang mudah, efisien, dan menguntungkan.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Menu</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#home" className="block hover:text-white transition-colors">Beranda</a>
                <a href="#features" className="block hover:text-white transition-colors">Fitur</a>
                <a href="#about" className="block hover:text-white transition-colors">Tentang</a>
                <a href="#contact" className="block hover:text-white transition-colors">Kontak</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Layanan</h3>
              <div className="space-y-2 text-gray-400">
                <p>Tukar Sampah</p>
                <p>Jemput Sampah</p>
                <p>Tracking Poin</p>
                <p>Customer Service</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Kontak</h3>
              <div className="space-y-2 text-gray-400">
                <p>+62 812 3456 7890</p>
                <p>info@banksampah.digital</p>
                <p>Jakarta, Indonesia</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Bank Sampah Digital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
