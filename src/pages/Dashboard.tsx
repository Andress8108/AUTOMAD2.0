import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Activity, FileText, TrendingUp, Clock, AlertTriangle, 
  User, Stethoscope, ClipboardList, UserPlus, Calendar, 
  BarChart3, Settings, Shield, Bell, Heart, Eye,
  CheckCircle, XCircle, AlertCircle, Plus, Search,
  Download, Filter, RefreshCw, ChevronRight, Star
} from 'lucide-react';
import { patientService, triageService } from '../services/api';

interface Stats {
  totalPacientes: number;
  evaluacionesHoy: number;
  triagesPendientes: number;
  emergencias: number;
  atendidos: number;
  derivados: number;
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

interface DashboardProps {
  user: any;
}

function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalPacientes: 0,
    evaluacionesHoy: 0,
    triagesPendientes: 0,
    emergencias: 0,
    atendidos: 0,
    derivados: 0
  });
  const [recentEvaluations, setRecentEvaluations] = useState<RecentEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [patientsResponse, triageStatsResponse, recentTriageResponse] = await Promise.all([
        patientService.getAll({ limit: 1 }),
        triageService.getStats(),
        triageService.getAll({ limit: 6 })
      ]);

      const patientsData = patientsResponse.data;
      const triageStatsData = triageStatsResponse.data;
      const recentTriageData = recentTriageResponse.data;

      if (patientsData.success && triageStatsData.success && recentTriageData.success) {
        const totalPacientes = patientsData.pagination?.totalRecords || 0;

        const today = new Date().toISOString().split('T')[0];
        const evaluacionesHoy = triageStatsData.data?.dailyStats?.find(
          (stat: any) => stat._id === today
        )?.count || 0;

        const statusStats = triageStatsData.data?.statusStats || [];
        const triagesPendientes = statusStats.find((stat: any) => stat._id === 'PENDIENTE')?.count || 0;
        const atendidos = statusStats.find((stat: any) => stat._id === 'ATENDIDO')?.count || 0;
        const derivados = statusStats.find((stat: any) => stat._id === 'DERIVADO')?.count || 0;

        const levelStats = triageStatsData.data?.levelStats || [];
        const emergencias = levelStats.filter(
          (stat: any) => stat._id === 'I' || stat._id === 'II'
        ).reduce((total: number, stat: any) => total + stat.count, 0);

        setStats({
          totalPacientes,
          evaluacionesHoy,
          triagesPendientes,
          emergencias,
          atendidos,
          derivados
        });

        setRecentEvaluations(recentTriageData.data || []);

        // Generate notifications based on data
        generateNotifications(triagesPendientes, emergencias, recentTriageData.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNotifications = (pendientes: number, emergencias: number, evaluations: any[]) => {
    const newNotifications = [];

    if (emergencias > 0) {
      newNotifications.push({
        id: 1,
        type: 'critical',
        title: 'Casos Críticos',
        message: `${emergencias} paciente(s) requieren atención inmediata`,
        time: 'Ahora'
      });
    }

    if (pendientes > 5) {
      newNotifications.push({
        id: 2,
        type: 'warning',
        title: 'Cola de Espera',
        message: `${pendientes} pacientes en espera de atención`,
        time: '5 min'
      });
    }

    const recentCritical = evaluations.filter(e => e.triageResult.level === 'I' || e.triageResult.level === 'II');
    if (recentCritical.length > 0) {
      newNotifications.push({
        id: 3,
        type: 'info',
        title: 'Nuevas Evaluaciones',
        message: `${recentCritical.length} evaluación(es) crítica(s) reciente(s)`,
        time: '10 min'
      });
    }

    setNotifications(newNotifications);
  };

  const getTriageColor = (nivel: string) => {
    switch (nivel) {
      case 'I': return 'text-red-700 bg-red-100 border-red-200';
      case 'II': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'III': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'IV': return 'text-green-600 bg-green-100 border-green-200';
      case 'V': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
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

  // Render different dashboards based on user role
  switch (user?.rol) {
    case 'MEDICO':
      return <MedicoDashboard user={user} stats={stats} recentEvaluations={recentEvaluations} notifications={notifications} error={error} onRefresh={fetchDashboardData} />;
    case 'ENFERMERO':
      return <EnfermeroDashboard user={user} stats={stats} recentEvaluations={recentEvaluations} notifications={notifications} error={error} onRefresh={fetchDashboardData} />;
    case 'RECEPCIONISTA':
      return <RecepcionistaDashboard user={user} stats={stats} recentEvaluations={recentEvaluations} notifications={notifications} error={error} onRefresh={fetchDashboardData} />;
    case 'ADMIN':
      return <AdminDashboard user={user} stats={stats} recentEvaluations={recentEvaluations} notifications={notifications} error={error} onRefresh={fetchDashboardData} />;
    default:
      return <AdminDashboard user={user} stats={stats} recentEvaluations={recentEvaluations} notifications={notifications} error={error} onRefresh={fetchDashboardData} />;
  }
}

// Médico Dashboard Component
function MedicoDashboard({ user, stats, recentEvaluations, notifications, error, onRefresh }: any) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Panel Médico - SAVISER</h1>
            <p className="text-blue-100">
              Dr./Dra. {user.nombre} - {user.especialidad || 'Medicina General'}
            </p>
            <p className="text-sm text-blue-200 mt-1">
              {new Date().toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onRefresh}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="relative">
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
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
                onClick={onRefresh}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Notificaciones Importantes
          </h2>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 ${
                  notification.type === 'critical' ? 'bg-red-50 border-red-500' :
                  notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Casos Críticos</p>
              <p className="text-3xl font-bold">{stats.emergencias}</p>
              <p className="text-xs text-red-200 mt-1">Niveles I y II</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">En Espera</p>
              <p className="text-3xl font-bold">{stats.triagesPendientes}</p>
              <p className="text-xs text-yellow-200 mt-1">Pendientes</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Atendidos Hoy</p>
              <p className="text-3xl font-bold">{stats.atendidos}</p>
              <p className="text-xs text-green-200 mt-1">Completados</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Pacientes</p>
              <p className="text-3xl font-bold">{stats.totalPacientes}</p>
              <p className="text-xs text-blue-200 mt-1">Registrados</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          Acciones Médicas Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/buscar')}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Consultar Pacientes</h3>
            <p className="text-sm text-gray-600">Ver historial médico completo</p>
          </button>

          <button
            onClick={() => navigate('/estadisticas')}
            className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <ChevronRight className="w-4 h-4 text-green-400 group-hover:text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Estadísticas Clínicas</h3>
            <p className="text-sm text-gray-600">Análisis y reportes médicos</p>
          </button>

          <button
            onClick={() => navigate('/prescripciones')}
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-6 h-6 text-purple-600" />
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Prescripciones</h3>
            <p className="text-sm text-gray-600">Generar recetas médicas</p>
          </button>

          <button
            onClick={() => navigate('/interconsultas')}
            className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <Star className="w-6 h-6 text-orange-600" />
              <ChevronRight className="w-4 h-4 text-orange-400 group-hover:text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Interconsultas</h3>
            <p className="text-sm text-gray-600">Derivar a especialistas</p>
          </button>
        </div>
      </div>

      {/* Priority Patients */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Pacientes Prioritarios
          </h2>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {recentEvaluations.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay evaluaciones recientes</p>
            <p className="text-sm text-gray-500">Los pacientes aparecerán aquí cuando sean evaluados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Paciente</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Prioridad</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Tiempo</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentEvaluations.map((evaluation) => (
                  <tr key={evaluation._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-800">{evaluation.nombrePaciente}</p>
                        <p className="text-sm text-gray-500">{evaluation.identificacionPaciente}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold border-2 ${getTriageColor(evaluation.triageResult.level)}`}>
                        {evaluation.triageResult.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{formatTimeAgo(evaluation.evaluationDate)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                        {evaluation.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Ver detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Atender">
                          <CheckCircle className="w-4 h-4" />
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
    </div>
  );
}

// Enfermero Dashboard Component
function EnfermeroDashboard({ user, stats, recentEvaluations, notifications, error, onRefresh }: any) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Panel de Enfermería - SAVISER</h1>
            <p className="text-teal-100">Enf. {user.nombre}</p>
            <p className="text-sm text-teal-200 mt-1">
              Evaluación de triage y atención - {new Date().toLocaleDateString('es-CO')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onRefresh}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="relative">
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
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
                onClick={onRefresh}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Evaluaciones Hoy</p>
              <p className="text-3xl font-bold">{stats.evaluacionesHoy}</p>
              <p className="text-xs text-green-200 mt-1">Completadas</p>
            </div>
            <Activity className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">En Cola</p>
              <p className="text-3xl font-bold">{stats.triagesPendientes}</p>
              <p className="text-xs text-yellow-200 mt-1">Por evaluar</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Urgentes</p>
              <p className="text-3xl font-bold">{stats.emergencias}</p>
              <p className="text-xs text-red-200 mt-1">Atención inmediata</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Pacientes</p>
              <p className="text-3xl font-bold">{stats.totalPacientes}</p>
              <p className="text-xs text-blue-200 mt-1">En sistema</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-teal-600" />
          Acciones de Enfermería
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/registro')}
            className="bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <Plus className="w-6 h-6 text-teal-600" />
              <ChevronRight className="w-4 h-4 text-teal-400 group-hover:text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Nueva Evaluación</h3>
            <p className="text-sm text-gray-600">Registrar y evaluar paciente</p>
          </button>

          <button
            onClick={() => navigate('/signos-vitales')}
            className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-6 h-6 text-red-600" />
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Signos Vitales</h3>
            <p className="text-sm text-gray-600">Monitoreo continuo</p>
          </button>

          <button
            onClick={() => navigate('/buscar')}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <Search className="w-6 h-6 text-blue-600" />
              <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Buscar Pacientes</h3>
            <p className="text-sm text-gray-600">Consultar registros</p>
          </button>

          <button
            onClick={() => navigate('/reportes')}
            className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <ChevronRight className="w-4 h-4 text-green-400 group-hover:text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Reportes</h3>
            <p className="text-sm text-gray-600">Estadísticas del turno</p>
          </button>
        </div>
      </div>

      {/* Triage Queue */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            Cola de Triage
          </h2>
          <span className="text-sm text-gray-600">
            Actualizado: {new Date().toLocaleTimeString('es-CO')}
          </span>
        </div>

        {recentEvaluations.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay pacientes en cola</p>
            <p className="text-sm text-gray-500">Los pacientes aparecerán aquí para evaluación</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEvaluations.map((evaluation, index) => (
              <div
                key={evaluation._id}
                className={`p-4 rounded-lg border-l-4 ${
                  evaluation.triageResult.level === 'I' ? 'border-red-500 bg-red-50' :
                  evaluation.triageResult.level === 'II' ? 'border-orange-500 bg-orange-50' :
                  evaluation.triageResult.level === 'III' ? 'border-yellow-500 bg-yellow-50' :
                  evaluation.triageResult.level === 'IV' ? 'border-green-500 bg-green-50' :
                  'border-blue-500 bg-blue-50'
                } hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">#{index + 1}</div>
                      <div className="text-xs text-gray-500">Cola</div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{evaluation.nombrePaciente}</h3>
                      <p className="text-sm text-gray-600">{evaluation.identificacionPaciente}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(evaluation.evaluationDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${getTriageColor(evaluation.triageResult.level)}`}>
                        {evaluation.triageResult.level}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">{evaluation.triageResult.name}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">
                        Evaluar
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Recepcionista Dashboard Component
function RecepcionistaDashboard({ user, stats, recentEvaluations, notifications, error, onRefresh }: any) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Panel de Recepción - SAVISER</h1>
            <p className="text-orange-100">{user.nombre}</p>
            <p className="text-sm text-orange-200 mt-1">
              Gestión de ingresos y registros - {new Date().toLocaleDateString('es-CO')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onRefresh}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="relative">
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
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
                onClick={onRefresh}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Registros Hoy</p>
              <p className="text-3xl font-bold">{stats.evaluacionesHoy}</p>
              <p className="text-xs text-blue-200 mt-1">Nuevos ingresos</p>
            </div>
            <UserPlus className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Pacientes</p>
              <p className="text-3xl font-bold">{stats.totalPacientes}</p>
              <p className="text-xs text-green-200 mt-1">En base de datos</p>
            </div>
            <Users className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">En Espera</p>
              <p className="text-3xl font-bold">{stats.triagesPendientes}</p>
              <p className="text-xs text-yellow-200 mt-1">Por atender</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Urgentes</p>
              <p className="text-3xl font-bold">{stats.emergencias}</p>
              <p className="text-xs text-red-200 mt-1">Prioridad alta</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-orange-600" />
          Acciones de Recepción
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/registro')}
            className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <Plus className="w-6 h-6 text-orange-600" />
              <ChevronRight className="w-4 h-4 text-orange-400 group-hover:text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Nuevo Registro</h3>
            <p className="text-sm text-gray-600">Registrar paciente nuevo</p>
          </button>

          <button
            onClick={() => navigate('/buscar')}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <Search className="w-6 h-6 text-blue-600" />
              <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Buscar Pacientes</h3>
            <p className="text-sm text-gray-600">Consultar registros existentes</p>
          </button>

          <button
            onClick={() => navigate('/citas')}
            className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-6 h-6 text-green-600" />
              <ChevronRight className="w-4 h-4 text-green-400 group-hover:text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Gestión de Citas</h3>
            <p className="text-sm text-gray-600">Programar y gestionar citas</p>
          </button>

          <button
            onClick={() => navigate('/reportes-recepcion')}
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Reportes</h3>
            <p className="text-sm text-gray-600">Estadísticas de ingresos</p>
          </button>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            Registros Recientes
          </h2>
          <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
            Ver todos
          </button>
        </div>

        {recentEvaluations.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay registros recientes</p>
            <p className="text-sm text-gray-500">Los nuevos registros aparecerán aquí</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Paciente</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Prioridad</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Tiempo</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentEvaluations.map((evaluation) => (
                  <tr key={evaluation._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{evaluation.nombrePaciente}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{evaluation.identificacionPaciente}</td>
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
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard({ user, stats, recentEvaluations, notifications, error, onRefresh }: any) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Panel de Administración - SAVISER</h1>
            <p className="text-gray-300">Admin. {user.nombre}</p>
            <p className="text-sm text-gray-400 mt-1">
              Control total del sistema - {new Date().toLocaleDateString('es-CO')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onRefresh}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="relative">
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
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
                onClick={onRefresh}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-600" />
          Estado del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-semibold text-green-800">Sistema Operativo</p>
              <p className="text-sm text-green-600">Todos los servicios funcionando</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="font-semibold text-blue-800">Base de Datos</p>
              <p className="text-sm text-blue-600">Conectada y sincronizada</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="font-semibold text-yellow-800">Respaldo</p>
              <p className="text-sm text-yellow-600">Último: hace 2 horas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Pacientes</p>
              <p className="text-3xl font-bold">{stats.totalPacientes}</p>
              <p className="text-xs text-blue-200 mt-1">Registrados en sistema</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Evaluaciones Hoy</p>
              <p className="text-3xl font-bold">{stats.evaluacionesHoy}</p>
              <p className="text-xs text-green-200 mt-1">Procesadas exitosamente</p>
            </div>
            <Activity className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
              <p className="text-3xl font-bold">{stats.triagesPendientes}</p>
              <p className="text-xs text-yellow-200 mt-1">En cola de atención</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Emergencias</p>
              <p className="text-3xl font-bold">{stats.emergencias}</p>
              <p className="text-xs text-red-200 mt-1">Casos críticos activos</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          Administración del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/usuarios')}
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-purple-600" />
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Gestión de Usuarios</h3>
            <p className="text-sm text-gray-600">Administrar personal médico</p>
          </button>

          <button
            onClick={() => navigate('/reportes-admin')}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Reportes Avanzados</h3>
            <p className="text-sm text-gray-600">Analytics y métricas</p>
          </button>

          <button
            onClick={() => navigate('/configuracion')}
            className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <Settings className="w-6 h-6 text-gray-600" />
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Configuración</h3>
            <p className="text-sm text-gray-600">Parámetros del sistema</p>
          </button>

          <button
            onClick={() => navigate('/auditoria')}
            className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-4 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-6 h-6 text-red-600" />
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Auditoría</h3>
            <p className="text-sm text-gray-600">Logs y seguridad</p>
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            Resumen del Sistema
          </h2>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {recentEvaluations.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay actividad reciente</p>
            <p className="text-sm text-gray-500">Las evaluaciones aparecerán aquí cuando se registren</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Paciente</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Prioridad</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Tiempo</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentEvaluations.map((evaluation) => (
                  <tr key={evaluation._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-800">{evaluation.nombrePaciente}</p>
                        <p className="text-sm text-gray-500">{evaluation.identificacionPaciente}</p>
                      </div>
                    </td>
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
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Ver detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Editar">
                          <Settings className="w-4 h-4" />
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
    </div>
  );
}

export default Dashboard;