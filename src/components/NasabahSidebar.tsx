import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import { toast } from '@/hooks/use-toast';
import {
  User,
  History,
  Truck,
  Star,
  LogOut,
  Recycle,
  PanelLeft,
  X,
  BarChart3,
  Gift
} from 'lucide-react';

const NasabahSidebar = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed on mobile

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsCollapsed(false); // Show sidebar on desktop
      } else {
        setIsCollapsed(true); // Hide sidebar on mobile
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success("Logout Berhasil", {
      description: "Anda telah keluar dari sistem"
    });
    navigate('/');
  };

  const menuItems = [
    { title: 'Dashboard', path: '/nasabah/dashboard', icon: BarChart3 },
    { title: 'Profil Saya', path: '/nasabah/profil', icon: User },
    { title: 'Riwayat Transaksi', path: '/nasabah/riwayat', icon: History },
    { title: 'Request Jemput', path: '/nasabah/jemput', icon: Truck },
    { title: 'Tukar Poin', path: '/nasabah/tukar-poin', icon: Gift }
  ];

  const userPoints = 1250; // This would come from your state management

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'}
        lg:fixed lg:transform-none
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-green rounded-lg flex items-center justify-center">
                <Recycle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Dashboard</h2>
                <p className="text-xs text-gray-500">Bank Sampah Digital</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Points Display - Enhanced */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="bg-gradient-to-r from-bank-green-600 to-bank-green-700 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90 font-medium">Total Poin</p>
                  <p className="text-2xl font-bold mt-1">{userPoints.toLocaleString()}</p>
                  <p className="text-xs opacity-75 mt-1">Siap ditukar</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - Flex container to push logout to bottom */}
        <div className="flex flex-col flex-1 p-4">
          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-bank-green-100 text-bank-green-700 border border-bank-green-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`
                }
                onClick={() => {
                  // Close sidebar on mobile when menu item is clicked
                  if (window.innerWidth < 1024) {
                    setIsCollapsed(true);
                  }

                  // Allow navigation to all implemented pages
                  const implementedPaths = [
                    '/nasabah/dashboard',
                    '/nasabah/profil',
                    '/nasabah/riwayat',
                    '/nasabah/jemput',
                    '/nasabah/tukar-poin'
                  ];

                  if (!implementedPaths.includes(item.path)) {
                    toast.info("Fitur Dalam Pengembangan", {
                      description: `${item.title} akan segera tersedia`
                    });
                  }
                }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium truncate">{item.title}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer - Now at bottom of flex container */}
          <div className="pt-4 border-t border-gray-200 mt-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              {!isCollapsed && <span>Keluar</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className={`fixed top-4 left-4 z-30 lg:hidden ${isCollapsed ? 'block' : 'hidden'}`}
      >
        <PanelLeft className="w-5 h-5" />
      </Button>
    </>
  );
};

export default NasabahSidebar;