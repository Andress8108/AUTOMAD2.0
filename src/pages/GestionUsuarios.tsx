import { useState, useEffect } from 'react';
import { Users, Plus, CreditCard as Edit, Trash2, Eye, Shield, UserCheck, UserX, Search, Filter, Download, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';

interface User {
  _id: string;
  nombre: string;
  email: string;
  rol: string;
  cedula: string;
  telefono: string;
  especialidad: string;
  activo: boolean;
  ultimoAcceso: string;
  createdAt: string;
}

function GestionUsuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'ENFERMERO',
    cedula: '',
    telefono: '',
    especialidad: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Note: This would need to be implemented in the backend
      // For now, we'll simulate the data
      const mockUsers: User[] = [
        {
          _id: '1',
          nombre: 'Dr. Juan Pérez',
          email: 'juan.perez@hospital.com',
          rol: 'MEDICO',
          cedula: '12345678',
          telefono: '3001234567',
          especialidad: 'Medicina Interna',
          activo: true,
          ultimoAcceso: new Date().toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          nombre: 'Enf. María García',
          email: 'maria.garcia@hospital.com',
          rol: 'ENFERMERO',
          cedula: '87654321',
          telefono: '3007654321',
          especialidad: 'Enfermería General',
          activo: true,
          ultimoAcceso: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          nombre: 'Ana López',
          email: 'ana.lopez@hospital.com',
          rol: 'RECEPCIONISTA',
          cedula: '11223344',
          telefono: '3009876543',
          especialidad: '',
          activo: false,
          ultimoAcceso: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = () => {
    setModalType('create');
    setSelectedUser(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'ENFERMERO',
      cedula: '',
      telefono: '',
      especialidad: ''
    });
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setModalType('edit');
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: '',
      rol: user.rol,
      cedula: user.cedula,
      telefono: user.telefono,
      especialidad: user.especialidad
    });
    setShowModal(true);
  };

  const handleViewUser = (user: User) => {
    setModalType('view');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleToggleStatus = async (user: User) => {
    if (window.confirm(`¿Está seguro de ${user.activo ? 'desactivar' : 'activar'} al usuario ${user.nombre}?`)) {
      try {
        // Simulate API call
        const updatedUsers = users.map(u => 
          u._id === user._id ? { ...u, activo: !u.activo } : u
        );
        setUsers(updatedUsers);
        alert(`Usuario ${user.activo ? 'desactivado' : 'activado'} exitosamente`);
      } catch (error) {
        alert('Error al cambiar el estado del usuario');
      }
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${user.nombre}? Esta acción no se puede deshacer.`)) {
      try {
        // Simulate API call
        const updatedUsers = users.filter(u => u._id !== user._id);
        setUsers(updatedUsers);
        alert('Usuario eliminado exitosamente');
      } catch (error) {
        alert('Error al eliminar el usuario');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (modalType === 'create') {
        // Simulate API call
        const newUser: User = {
          _id: Date.now().toString(),
          ...formData,
          activo: true,
          ultimoAcceso: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        setUsers([...users, newUser]);
        alert('Usuario creado exitosamente');
      } else if (modalType === 'edit' && selectedUser) {
        // Simulate API call
        const updatedUsers = users.map(u => 
          u._id === selectedUser._id ? { ...u, ...formData } : u
        );
        setUsers(updatedUsers);
        alert('Usuario actualizado exitosamente');
      }
      
      setShowModal(false);
    } catch (error) {
      alert('Error al guardar el usuario');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.cedula.includes(searchTerm);
    const matchesRole = filterRole === '' || user.rol === filterRole;
    const matchesStatus = filterStatus === '' || 
                         (filterStatus === 'active' && user.activo) ||
                         (filterStatus === 'inactive' && !user.activo);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'MEDICO': return 'Médico';
      case 'ENFERMERO': return 'Enfermero';
      case 'RECEPCIONISTA': return 'Recepcionista';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'MEDICO': return 'bg-blue-100 text-blue-800';
      case 'ENFERMERO': return 'bg-green-100 text-green-800';
      case 'RECEPCIONISTA': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-l-4 border-purple-600 pl-4">
          <h1 className="text-2xl font-bold text-gray-800 uppercase">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-600 mt-1">Cargando usuarios del sistema...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-purple-600 pl-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 uppercase">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-600 mt-1">
              Administrar personal médico y usuarios del sistema
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
            <button
              onClick={handleCreateUser}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-red-800 font-medium">Error: {error}</p>
              <button
                onClick={fetchUsers}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-purple-600" />
            Filtros de Búsqueda
          </h2>
          <span className="text-sm text-gray-600">
            {filteredUsers.length} usuario(s) encontrado(s)
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Buscar:
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre, email o cédula"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rol:
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">Administrador</option>
              <option value="MEDICO">Médico</option>
              <option value="ENFERMERO">Enfermero</option>
              <option value="RECEPCIONISTA">Recepcionista</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRole('');
                setFilterStatus('');
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Lista de Usuarios
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron usuarios</p>
            <p className="text-sm text-gray-500">Intente con otros términos de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Rol</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Último Acceso</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-800">{user.nombre}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Cédula: {user.cedula}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                        {getRoleDisplayName(user.rol)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {user.activo ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 text-sm font-medium">Activo</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 text-sm font-medium">Inactivo</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 text-sm">
                      {formatDate(user.ultimoAcceso)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.activo 
                              ? 'text-yellow-600 hover:bg-yellow-100' 
                              : 'text-green-600 hover:bg-green-100'
                          }`}
                          title={user.activo ? 'Desactivar' : 'Activar'}
                        >
                          {user.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {modalType === 'create' && <><Plus className="w-6 h-6 text-purple-600" />Crear Usuario</>}
                  {modalType === 'edit' && <><Edit className="w-6 h-6 text-green-600" />Editar Usuario</>}
                  {modalType === 'view' && <><Eye className="w-6 h-6 text-blue-600" />Ver Usuario</>}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {modalType === 'view' && selectedUser ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre:</label>
                      <p className="text-gray-800">{selectedUser.nombre}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email:</label>
                      <p className="text-gray-800">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Cédula:</label>
                      <p className="text-gray-800">{selectedUser.cedula}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono:</label>
                      <p className="text-gray-800">{selectedUser.telefono || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Rol:</label>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.rol)}`}>
                        {getRoleDisplayName(selectedUser.rol)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Estado:</label>
                      <div className="flex items-center gap-2">
                        {selectedUser.activo ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 text-sm font-medium">Activo</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 text-sm font-medium">Inactivo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedUser.especialidad && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Especialidad:</label>
                      <p className="text-gray-800">{selectedUser.especialidad}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Registro:</label>
                      <p className="text-gray-800">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Último Acceso:</label>
                      <p className="text-gray-800">{formatDate(selectedUser.ultimoAcceso)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cédula *
                      </label>
                      <input
                        type="text"
                        value={formData.cedula}
                        onChange={(e) => setFormData(prev => ({ ...prev, cedula: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rol *
                      </label>
                      <select
                        value={formData.rol}
                        onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                        Especialidad
                      </label>
                      <input
                        type="text"
                        value={formData.especialidad}
                        onChange={(e) => setFormData(prev => ({ ...prev, especialidad: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Especialidad médica (si aplica)"
                      />
                    </div>
                  </div>
                  
                  {modalType === 'create' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {modalType === 'create' ? 'Crear Usuario' : 'Actualizar Usuario'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionUsuarios;