import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, FileText, TrendingUp, Clock, AlertTriangle, User } from 'lucide-react';
import { patientService, triageService } from '../services/api';

interface Stats {
  totalPacientes: number;
  evaluacionesHoy: number;
  triagesPendientes: number;
  emergencias: number;
}

interface RecentEvaluation {
  _id: string;
  nombrePaciente: string;
  identificacionPaciente: string;
  triageResult: {
    level: string;
    name: string;
  };
  evaluationDate: string;
  status: string;
}

function Inicio() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    totalPacientes: 0,
    evaluacionesHoy: 0,
    triagesPendientes: 0,
    emergencias: 0
  });
  const [recentEvaluations, setRecentEvaluations] = useState<RecentEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user info from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const patientsResponse = await patientService.getAll({ limit: 1 });
      const patientsData = patientsResponse.data;

      const triageStatsResponse = await triageService.getStats();
      const triageStatsData = triageStatsResponse.data;

      const recentTriageResponse = await triageService.getAll({ limit: 4 });
      const recentTriageData = recentTriageResponse.data;

      if (patientsData.success && triageStatsData.success && recentTriageData.success) {
        const totalPacientes = patientsData.pagination?.totalRecords || 0;
        const totalEvaluations = triageStatsData.data?.totalEvaluations || 0;

        const today = new Date().toISOString().split('T')[0];
        const evaluacionesHoy = triageStatsData.data?.dailyStats?.find(
          (stat: any) => stat._id === today
        )?.count || 0;

        const statusStats = triageStatsData.data?.statusStats || [];
        const triagesPendientes = statusStats.find(
          (stat: any) => stat._id === 'PENDIENTE'
        )?.count || 0;

        const levelStats = triageStatsData.data?.levelStats || [];
        const emergencias = levelStats.filter(
          (stat: any) => stat._id === 'I' || stat._id === 'II'
        ).reduce((total: number, stat: any) => total + stat.count, 0);

        setStats({
          totalPacientes,
          evaluacionesHoy,
          triagesPendientes,
          emergencias
        });

        setRecentEvaluations(recentTriageData.data || []);
      } else {
        throw new Error('Error al obtener los datos del dashboard');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const getTriageColor = (nivel: string) => {
    switch (nivel) {
      case 'I': return 'text-red-700 bg-red-100';
      case 'II': return 'text-orange-600 bg-orange-100';
      case 'III': return 'text-yellow-600 bg-yellow-100';
      case 'IV': return 'text-green-600 bg-green-100';
      case 'V': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'text-yellow-700 bg-yellow-100';
      case 'EN_ATENCION': return 'text-blue-700 bg-blue-100';
      case 'ATENDIDO': return 'text-green-700 bg-green-100';
      case 'DERIVADO': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`;
    return `${Math.floor(diffInMinutes / 1440)} d`;
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-l-4 border-teal-600 pl-4">
          <h1 className="text-2xl font-bold text-gray-800 uppercase">Panel de Control SAVISER</h1>
          <p className="text-sm text-gray-600 mt-1">Cargando datos del sistema...</p>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-teal-600 pl-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 uppercase">Panel de Control SAVISER</h1>
            <p className="text-sm text-gray-600 mt-1">
              Sistema de Clasificación de Triage - {new Date().toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          {user && (
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Bienvenido, <strong>{user.nombre}</strong></span>
              </div>
              <p className="text-xs text-gray-500">{getRoleDisplayName(user.rol)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <p className="text-red-600 text-sm mt-1">
            Verifique que el servidor backend esté ejecutándose
          </p>
          <button
            onClick={fetchDashboardData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Pacientes</p>
              <p className="text-3xl font-bold">{stats.totalPacientes}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Evaluaciones Hoy</p>
              <p className="text-3xl font-bold">{stats.evaluacionesHoy}</p>
            </div>
            <Activity className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
              <p className="text-3xl font-bold">{stats.triagesPendientes}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Emergencias</p>
              <p className="text-3xl font-bold">{stats.emergencias}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/registro')}
            className="bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg p-4 text-left transition-colors"
          >
            <FileText className="w-6 h-6 text-teal-600 mb-2" />
            <h3 className="font-semibold text-gray-800">Nuevo Paciente</h3>
            <p className="text-sm text-gray-600">Registrar un nuevo paciente en el sistema</p>
          </button>

          <button
            onClick={() => navigate('/buscar')}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors"
          >
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-800">Buscar Pacientes</h3>
            <p className="text-sm text-gray-600">Buscar y consultar pacientes registrados</p>
          </button>

          <button
            onClick={() => navigate('/estadisticas')}
            className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors"
          >
            <Activity className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-800">Estadísticas</h3>
            <p className="text-sm text-gray-600">Ver reportes y estadísticas del sistema</p>
          </button>
        </div>
      </div>

      {/* Recent Evaluations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          Evaluaciones Recientes
        </h2>
        
        {recentEvaluations.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay evaluaciones recientes</p>
            <p className="text-sm text-gray-500">
              Las evaluaciones de triage aparecerán aquí una vez que se registren
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Paciente</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Nivel</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Tiempo</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentEvaluations.map((evaluation) => (
                  <tr key={evaluation._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{evaluation.nombrePaciente}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getTriageColor(evaluation.triageResult.level)}`}>
                        {evaluation.triageResult.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{formatTimeAgo(evaluation.evaluationDate)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                        {evaluation.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Info */}
      <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-lg p-6 border border-teal-200">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${error ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <h3 className="font-semibold text-gray-800">
            {error ? 'Sistema con Errores' : 'Sistema Operativo'}
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {error 
            ? 'Algunos servicios no están disponibles' 
            : 'Todos los servicios funcionando correctamente'
          }
        </p>
        <p className="text-xs text-gray-500">
          Última actualización: {new Date().toLocaleTimeString('es-CO')}
        </p>
      </div>
    </div>
  );
}

export default Inicio;