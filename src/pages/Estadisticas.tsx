import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Activity, Clock, AlertTriangle,
  Calendar, Download, Filter, RefreshCw, Eye, ChevronDown
} from 'lucide-react';
import { triageService, patientService } from '../services/api';

interface TriageStats {
  totalEvaluations: number;
  levelStats: Array<{
    _id: string;
    count: number;
    name: string;
  }>;
  statusStats: Array<{
    _id: string;
    count: number;
  }>;
  dailyStats: Array<{
    _id: string;
    count: number;
  }>;
}

function Estadisticas() {
  const [stats, setStats] = useState<TriageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'trends'>('overview');

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await triageService.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(response.data.message || 'Error al obtener estadísticas');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const getTriageColor = (level: string) => {
    switch (level) {
      case 'I': return 'bg-red-500';
      case 'II': return 'bg-orange-500';
      case 'III': return 'bg-yellow-500';
      case 'IV': return 'bg-green-500';
      case 'V': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTriageName = (level: string) => {
    switch (level) {
      case 'I': return 'Resucitación';
      case 'II': return 'Emergencia';
      case 'III': return 'Urgencia';
      case 'IV': return 'Urgencia Menor';
      case 'V': return 'No Urgente';
      default: return 'Desconocido';
    }
  };

  const exportData = () => {
    if (!stats) return;

    const csvContent = [
      ['Nivel', 'Nombre', 'Cantidad', 'Porcentaje'],
      ...stats.levelStats.map(stat => [
        stat._id,
        getTriageName(stat._id),
        stat.count.toString(),
        ((stat.count / stats.totalEvaluations) * 100).toFixed(1) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estadisticas_triage_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-l-4 border-blue-600 pl-4">
          <h1 className="text-2xl font-bold text-gray-800 uppercase">Estadísticas del Sistema</h1>
          <p className="text-sm text-gray-600 mt-1">Cargando datos estadísticos...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-blue-600 pl-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 uppercase">Estadísticas del Sistema</h1>
            <p className="text-sm text-gray-600 mt-1">
              Análisis y métricas del sistema SAVISER
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchStats}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-red-800 font-medium">Error: {error}</p>
              <button
                onClick={fetchStats}
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
            <Filter className="w-5 h-5 text-blue-600" />
            Filtros y Configuración
          </h2>
          <div className="flex items-center gap-4">
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">Vista General</option>
              <option value="detailed">Vista Detallada</option>
              <option value="trends">Tendencias</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha Inicio:
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha Fin:
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchStats}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Evaluaciones</p>
                  <p className="text-3xl font-bold">{stats.totalEvaluations}</p>
                  <p className="text-xs text-blue-200 mt-1">Período seleccionado</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Casos Críticos</p>
                  <p className="text-3xl font-bold">
                    {stats.levelStats.filter(s => s._id === 'I' || s._id === 'II').reduce((sum, s) => sum + s.count, 0)}
                  </p>
                  <p className="text-xs text-red-200 mt-1">Niveles I y II</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Atendidos</p>
                  <p className="text-3xl font-bold">
                    {stats.statusStats.find(s => s._id === 'ATENDIDO')?.count || 0}
                  </p>
                  <p className="text-xs text-green-200 mt-1">Completados</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                  <p className="text-3xl font-bold">
                    {stats.statusStats.find(s => s._id === 'PENDIENTE')?.count || 0}
                  </p>
                  <p className="text-xs text-yellow-200 mt-1">En espera</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </div>
          </div>

          {/* Triage Level Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Distribución por Nivel de Triage
            </h2>
            
            <div className="space-y-4">
              {stats.levelStats.map((stat) => {
                const percentage = (stat.count / stats.totalEvaluations) * 100;
                return (
                  <div key={stat._id} className="flex items-center gap-4">
                    <div className="w-16 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${getTriageColor(stat._id)}`}>
                        {stat._id}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-800">{getTriageName(stat._id)}</span>
                        <span className="text-sm text-gray-600">{stat.count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getTriageColor(stat._id)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Estado de los Pacientes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.statusStats.map((stat) => {
                const percentage = (stat.count / stats.totalEvaluations) * 100;
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'PENDIENTE': return 'bg-yellow-500';
                    case 'EN_ATENCION': return 'bg-blue-500';
                    case 'ATENDIDO': return 'bg-green-500';
                    case 'DERIVADO': return 'bg-purple-500';
                    default: return 'bg-gray-500';
                  }
                };

                return (
                  <div key={stat._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">
                        {stat._id.replace('_', ' ')}
                      </span>
                      <span className={`w-3 h-3 rounded-full ${getStatusColor(stat._id)}`}></span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.count}</div>
                    <div className="text-sm text-gray-600">{percentage.toFixed(1)}% del total</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Trends */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Tendencia Diaria (Últimos 7 días)
            </h2>
            
            {stats.dailyStats.length > 0 ? (
              <div className="space-y-3">
                {stats.dailyStats.map((stat) => {
                  const maxCount = Math.max(...stats.dailyStats.map(s => s.count));
                  const percentage = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={stat._id} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-gray-600">
                        {new Date(stat._id).toLocaleDateString('es-CO', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            >
                              <span className="text-xs text-white font-medium">
                                {stat.count}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay datos de tendencia disponibles</p>
                <p className="text-sm text-gray-500">Los datos aparecerán cuando haya evaluaciones registradas</p>
              </div>
            )}
          </div>

          {/* Detailed View */}
          {selectedView === 'detailed' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Vista Detallada
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nivel</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Cantidad</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Porcentaje</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Tiempo Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.levelStats.map((stat) => {
                      const percentage = (stat.count / stats.totalEvaluations) * 100;
                      return (
                        <tr key={stat._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${getTriageColor(stat._id)}`}>
                              {stat._id}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800">{getTriageName(stat._id)}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{stat.count}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{percentage.toFixed(1)}%</td>
                          <td className="py-3 px-4 text-center text-gray-600">
                            {stat._id === 'I' ? 'Inmediato' :
                             stat._id === 'II' ? '10 min' :
                             stat._id === 'III' ? '60 min' :
                             stat._id === 'IV' ? '120 min' : '240 min'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Estadisticas;