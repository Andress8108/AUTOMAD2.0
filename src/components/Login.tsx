import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'ENFERMERO',
    cedula: '',
    telefono: '',
    especialidad: ''
  });
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleRegisterChange = (field: string, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        email: formData.email.toLowerCase(),
        password: formData.password
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        onLoginSuccess(user, token);
      } else {
        setError(response.data.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setError('Credenciales incorrectas. Verifique su email y contraseña.');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('No se puede conectar al servidor. Verifique que el backend esté ejecutándose.');
      } else {
        setError('Error de conexión. Intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.nombre || !registerData.email || !registerData.password || !registerData.cedula) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register({
        nombre: registerData.nombre,
        email: registerData.email.toLowerCase(),
        password: registerData.password,
        rol: registerData.rol,
        cedula: registerData.cedula,
        telefono: registerData.telefono,
        especialidad: registerData.especialidad
      });

      if (response.data.success) {
        setRegisterSuccess(true);
        setTimeout(() => {
          setShowRegister(false);
          setRegisterSuccess(false);
          setRegisterData({
            nombre: '',
            email: '',
            password: '',
            confirmPassword: '',
            rol: 'ENFERMERO',
            cedula: '',
            telefono: '',
            especialidad: ''
          });
        }, 2000);
      } else {
        setError(response.data.message || 'Error al registrar usuario');
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('No se puede conectar al servidor. Verifique que el backend esté ejecutándose.');
      } else {
        setError('Error de conexión. Intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showRegister) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img
                  src="/public/ChatGPT Image 24 oct 2025, 14_05_26.png"
                  alt="SAVISER Logo"
                  className="h-16 w-auto"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Registro de Usuario</h1>
              <p className="text-gray-600 mt-2">Sistema SAVISER</p>
            </div>

            {registerSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">¡Usuario registrado exitosamente!</p>
                  <p className="text-sm text-green-600">Ahora puede iniciar sesión</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={registerData.nombre}
                  onChange={(e) => handleRegisterChange('nombre', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Ingrese su nombre completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cédula *
                </label>
                <input
                  type="text"
                  value={registerData.cedula}
                  onChange={(e) => handleRegisterChange('cedula', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Número de cédula"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => handleRegisterChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  value={registerData.rol}
                  onChange={(e) => handleRegisterChange('rol', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="ENFERMERO">Enfermero</option>
                  <option value="MEDICO">Médico</option>
                  <option value="RECEPCIONISTA">Recepcionista</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={registerData.telefono}
                  onChange={(e) => handleRegisterChange('telefono', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Número de teléfono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Especialidad
                </label>
                <input
                  type="text"
                  value={registerData.especialidad}
                  onChange={(e) => handleRegisterChange('especialidad', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Especialidad médica (si aplica)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => handleRegisterChange('password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Repita la contraseña"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  isLoading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {isLoading ? 'Registrando...' : 'Registrar Usuario'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowRegister(false)}
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                ← Volver al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/public/ChatGPT Image 24 oct 2025, 14_05_26.png"
                alt="SAVISER Logo"
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h1>
            <p className="text-gray-600 mt-2">Sistema SAVISER</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Ingrese su contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                isLoading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => setShowRegister(true)}
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                Registrarse
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500">
              <p className="mb-2">Sistema de Clasificación de Triage</p>
              <p>Versión 1.0 - 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;