import { useState, useEffect } from 'react';
import { Search, User, Calendar, FileText, Eye, CreditCard as Edit, Trash2, ExternalLink } from 'lucide-react';
import { patientService } from '../services/api';

interface Patient {
  _id: string;
  identificacion: string;
  nombre: string;
  edad: string;
  sexo: string;
  tipoSangre: string;
  alergias: string;
  enfermedadesBase: string;
  medicamentosActuales: string;
  motivoConsulta: string;
  acompanante: string;
  fechaHora: string;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function BuscarPacientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNext: false,
    hasPrev: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener pacientes de la API
  const fetchPatients = async (page: number = 1, search: string = '') => {
    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        page: page.toString(),
        limit: '10'
      };

      if (search) {
        params.search = search;
      }

      const response = await patientService.getAll(params);
      const data = response.data;

      if (data.success) {
        setPatients(data.data);
        setPagination(data.pagination);
      } else {
        throw new Error(data.message || 'Error al obtener los pacientes');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      setPatients([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar pacientes al montar el componente
  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPatients(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchPatients(newPage, searchTerm);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    // Implementar edición
    console.log('Editar paciente:', patient);
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (window.confirm(`¿Está seguro de eliminar al paciente ${patient.nombre}?`)) {
      try {
        await patientService.delete(patient._id);
        fetchPatients(currentPage, searchTerm);
        alert('Paciente eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Error al eliminar el paciente');
      }
    }
  };

  // Función para abrir documentos médicos del paciente
  const openPatientDocuments = (patient: Patient) => {
    // Crear una nueva ventana con los documentos médicos del paciente
    const documentWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    if (documentWindow) {
      documentWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Documentos Médicos - ${patient.nombre}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              min-height: 100vh;
              padding: 20px;
            }
            .container {
              max-width: 1100px;
              margin: 0 auto;
              background: white;
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              font-size: 2.5rem;
              margin-bottom: 10px;
              font-weight: 300;
            }
            .header p {
              font-size: 1.1rem;
              opacity: 0.9;
            }
            .patient-info {
              background: #f8f9fa;
              padding: 25px;
              border-bottom: 1px solid #e9ecef;
            }
            .patient-info h2 {
              color: #495057;
              margin-bottom: 15px;
              font-size: 1.5rem;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 15px;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #dee2e6;
            }
            .info-label {
              font-weight: 600;
              color: #6c757d;
            }
            .info-value {
              color: #495057;
              font-weight: 500;
            }
            .documents-section {
              padding: 30px;
            }
            .section-title {
              color: #495057;
              font-size: 1.8rem;
              margin-bottom: 25px;
              padding-bottom: 10px;
              border-bottom: 3px solid #667eea;
            }
            .document-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 25px;
              margin-bottom: 30px;
            }
            .document-card {
              background: #fff;
              border: 1px solid #e9ecef;
              border-radius: 10px;
              padding: 25px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.08);
              transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .document-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            }
            .document-header {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
            }
            .document-icon {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
              font-size: 18px;
              color: white;
            }
            .document-title {
              font-size: 1.2rem;
              font-weight: 600;
              color: #495057;
            }
            .document-content {
              color: #6c757d;
              line-height: 1.6;
            }
            .no-data {
              text-align: center;
              color: #6c757d;
              font-style: italic;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              margin: 10px 0;
            }
            .close-btn {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #dc3545;
              color: white;
              border: none;
              padding: 12px 20px;
              border-radius: 25px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
              transition: all 0.3s ease;
            }
            .close-btn:hover {
              background: #c82333;
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-active {
              background: #d4edda;
              color: #155724;
            }
            .status-pending {
              background: #fff3cd;
              color: #856404;
            }
            .date-info {
              font-size: 0.9rem;
              color: #6c757d;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <button class="close-btn" onclick="window.close()">✕ Cerrar</button>
          
          <div class="container">
            <div class="header">
              <h1>📋 Documentos Médicos</h1>
              <p>Historial clínico completo del paciente</p>
            </div>

            <div class="patient-info">
              <h2>👤 Información del Paciente</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Nombre:</span>
                  <span class="info-value">${patient.nombre}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Identificación:</span>
                  <span class="info-value">${patient.identificacion}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Edad:</span>
                  <span class="info-value">${patient.edad} años</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Sexo:</span>
                  <span class="info-value">${patient.sexo}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tipo de Sangre:</span>
                  <span class="info-value">${patient.tipoSangre}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Fecha de Registro:</span>
                  <span class="info-value">${patient.fechaHora}</span>
                </div>
              </div>
            </div>

            <div class="documents-section">
              <h2 class="section-title">📄 Historia Clínica</h2>
              <div class="document-grid">
                <div class="document-card">
                  <div class="document-header">
                    <div class="document-icon" style="background: #28a745;">📋</div>
                    <div class="document-title">Historia Clínica General</div>
                  </div>
                  <div class="document-content">
                    <p><strong>Motivo de Consulta:</strong> ${patient.motivoConsulta}</p>
                    <p><strong>Alergias:</strong> ${patient.alergias || 'No reporta alergias conocidas'}</p>
                    <p><strong>Enfermedades Base:</strong> ${patient.enfermedadesBase || 'No reporta enfermedades base'}</p>
                    <p><strong>Medicamentos Actuales:</strong> ${patient.medicamentosActuales || 'No reporta medicamentos actuales'}</p>
                    ${patient.acompanante ? `<p><strong>Acompañante:</strong> ${patient.acompanante}</p>` : ''}
                    <div class="date-info">📅 Última actualización: ${new Date().toLocaleDateString('es-CO')}</div>
                  </div>
                </div>

                <div class="document-card">
                  <div class="document-header">
                    <div class="document-icon" style="background: #17a2b8;">🩺</div>
                    <div class="document-title">Evaluaciones de Triage</div>
                  </div>
                  <div class="document-content">
                    <div class="no-data">
                      No hay evaluaciones de triage registradas para este paciente.
                      <br><br>
                      <small>Las evaluaciones aparecerán aquí una vez que el paciente sea evaluado en el sistema de triage.</small>
                    </div>
                  </div>
                </div>
              </div>

              <h2 class="section-title">🧪 Exámenes y Laboratorios</h2>
              <div class="document-grid">
                <div class="document-card">
                  <div class="document-header">
                    <div class="document-icon" style="background: #ffc107;">🧪</div>
                    <div class="document-title">Exámenes de Laboratorio</div>
                  </div>
                  <div class="document-content">
                    <div class="no-data">
                      No hay exámenes de laboratorio registrados.
                      <br><br>
                      <small>Los resultados de laboratorio aparecerán aquí una vez que sean cargados al sistema.</small>
                    </div>
                  </div>
                </div>

                <div class="document-card">
                  <div class="document-header">
                    <div class="document-icon" style="background: #6f42c1;">📊</div>
                    <div class="document-title">Estudios de Imagen</div>
                  </div>
                  <div class="document-content">
                    <div class="no-data">
                      No hay estudios de imagen registrados.
                      <br><br>
                      <small>Radiografías, ecografías y otros estudios aparecerán aquí.</small>
                    </div>
                  </div>
                </div>
              </div>

              <h2 class="section-title">📝 Órdenes Médicas</h2>
              <div class="document-grid">
                <div class="document-card">
                  <div class="document-header">
                    <div class="document-icon" style="background: #fd7e14;">📝</div>
                    <div class="document-title">Órdenes Médicas Activas</div>
                  </div>
                  <div class="document-content">
                    <div class="no-data">
                      No hay órdenes médicas activas.
                      <br><br>
                      <small>Las órdenes médicas emitidas por los profesionales aparecerán aquí.</small>
                    </div>
                  </div>
                </div>

                <div class="document-card">
                  <div class="document-header">
                    <div class="document-icon" style="background: #20c997;">💊</div>
                    <div class="document-title">Recetas Médicas</div>
                  </div>
                  <div class="document-content">
                    <div class="no-data">
                      No hay recetas médicas registradas.
                      <br><br>
                      <small>Las prescripciones médicas aparecerán aquí una vez que sean emitidas.</small>
                    </div>
                  </div>
                </div>
              </div>

              <h2 class="section-title">📈 Seguimiento y Evolución</h2>
              <div class="document-grid">
                <div class="document-card">
                  <div class="document-header">
                    <div class="document-icon" style="background: #e83e8c;">📈</div>
                    <div class="document-title">Notas de Evolución</div>
                  </div>
                  <div class="document-content">
                    <div class="no-data">
                      No hay notas de evolución registradas.
                      <br><br>
                      <small>Las notas de seguimiento del personal médico aparecerán aquí.</small>
                    </div>
                  </div>
                </div>

                <div class="document-card">
                  <div class="document-header">
                    <div class="document-icon" style="background: #6c757d;">📋</div>
                    <div class="document-title">Resumen de Atención</div>
                  </div>
                  <div class="document-content">
                    <p><strong>Estado del Paciente:</strong> <span class="status-badge status-active">Activo</span></p>
                    <p><strong>Última Consulta:</strong> ${patient.fechaHora}</p>
                    <p><strong>Próxima Cita:</strong> No programada</p>
                    <div class="date-info">📅 Generado: ${new Date().toLocaleString('es-CO')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <script>
            // Agregar funcionalidad para cerrar con Escape
            document.addEventListener('keydown', function(e) {
              if (e.key === 'Escape') {
                window.close();
              }
            });
          </script>
        </body>
        </html>
      `);
      
      documentWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-blue-600 pl-4">
        <h1 className="text-2xl font-bold text-gray-800 uppercase">Buscar Pacientes</h1>
        <p className="text-sm text-gray-600 mt-1">
          Consultar y gestionar pacientes registrados en el sistema
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar por nombre o identificación:
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ingrese nombre o número de identificación"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isLoading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <p className="text-red-600 text-sm mt-1">
            Verifique que el servidor backend esté ejecutándose
          </p>
        </div>
      )}

      {/* Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Resultados de Búsqueda
          </h2>
          <span className="text-sm text-gray-600">
            {pagination.totalRecords} paciente(s) encontrado(s)
          </span>
        </div>

        {patients.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {error ? 'No se pudieron cargar los pacientes' : 'No se encontraron pacientes'}
            </p>
            <p className="text-sm text-gray-500">
              {error ? 'Verifique la conexión con el servidor' : 'Intente con otros términos de búsqueda'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Identificación</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Edad</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Sexo</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Tipo Sangre</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Fecha Registro</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openPatientDocuments(patient)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          title="Ver documentos médicos"
                        >
                          {patient.identificacion}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{patient.nombre}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{patient.edad}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{patient.sexo}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{patient.tipoSangre}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{patient.fechaHora}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewPatient(patient)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditPatient(patient)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient)}
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Página {pagination.currentPage} de {pagination.totalPages} 
                  ({pagination.totalRecords} registros total)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      pagination.hasPrev
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      pagination.hasNext
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for Patient Details */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Detalles del Paciente
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Identificación:</label>
                    <p className="text-gray-800">{selectedPatient.identificacion}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre:</label>
                    <p className="text-gray-800">{selectedPatient.nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Edad:</label>
                    <p className="text-gray-800">{selectedPatient.edad} años</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sexo:</label>
                    <p className="text-gray-800">{selectedPatient.sexo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Sangre:</label>
                    <p className="text-gray-800">{selectedPatient.tipoSangre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Acompañante:</label>
                    <p className="text-gray-800">{selectedPatient.acompanante || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Alergias:</label>
                  <p className="text-gray-800">{selectedPatient.alergias || 'Ninguna'}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Enfermedades Base:</label>
                  <p className="text-gray-800">{selectedPatient.enfermedadesBase || 'Ninguna'}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Medicamentos Actuales:</label>
                  <p className="text-gray-800">{selectedPatient.medicamentosActuales || 'Ninguno'}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo de Consulta:</label>
                  <p className="text-gray-800">{selectedPatient.motivoConsulta}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Registrado: {selectedPatient.fechaHora}</span>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => openPatientDocuments(selectedPatient)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver Documentos Médicos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuscarPacientes;