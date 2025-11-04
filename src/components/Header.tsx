import { useState } from 'react';
import { LogOut, User, Settings } from 'lucide-react';

interface HeaderProps {
  user: any;
  onLogout: () => void;
}

function Header({ user, onLogout }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      onLogout();
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'MEDICO': return 'Médico';
      case 'ENFERMERO': return 'Enfermero';
      case 'RECEPCIONISTA': return 'Recepcionista';
      default: return role;
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/public/ChatGPT Image 24 oct 2025, 14_05_26.png"
            alt="SAVISER Logo"
            className="h-8 w-auto"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-800">Sistema SAVISER</h1>
            <p className="text-xs text-gray-600">Sistema de Clasificación de Triage</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{user.nombre}</p>
              <p className="text-xs text-gray-600">{getRoleDisplayName(user.rol)}</p>
            </div>
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{user.nombre}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(user.rol)}</p>
              </div>
              
              <button
                onClick={() => setShowUserMenu(false)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configuración
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;