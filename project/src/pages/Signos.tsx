import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService, triageService } from '../services/api';

interface PatientData {
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
}

interface VitalSigns {
  temperatura: string;
  presionSistolica: string;
  presionDiastolica: string;
  frecuenciaCardiaca: string;
  frecuenciaRespiratoria: string;
  saturacionO2: string;
}

function Signos() {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [triageResult, setTriageResult] = useState<string | null>(null);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    temperatura: '',
    presionSistolica: '',
    presionDiastolica: '',
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',
    saturacionO2: ''
  });

  useEffect(() => {
    // Load patient data from localStorage
    const savedPatientData = localStorage.getItem('patientData');
    if (savedPatientData) {
      setPatientData(JSON.parse(savedPatientData));
    } else {
      // If no patient data, redirect to registration
      navigate('/');
    }
  }, [navigate]);

  const handleVitalSignsChange = (field: keyof VitalSigns, value: string) => {
    setVitalSigns(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleClear = () => {
    setVitalSigns({
      temperatura: '',
      presionSistolica: '',
      presionDiastolica: '',
      frecuenciaCardiaca: '',
      frecuenciaRespiratoria: '',
      saturacionO2: ''
    });
    setTriageResult(null);
  };

  const calculateTriage = (): string => {
    const temp = parseFloat(vitalSigns.temperatura);
    const sistolica = parseFloat(vitalSigns.presionSistolica);
    const diastolica = parseFloat(vitalSigns.presionDiastolica);
    const fc = parseFloat(vitalSigns.frecuenciaCardiaca);
    const fr = parseFloat(vitalSigns.frecuenciaRespiratoria);
    const o2 = parseFloat(vitalSigns.saturacionO2);

    if (
      temp > 40 || temp < 35 ||
      sistolica > 180 || sistolica < 90 ||
      fc > 120 || fc < 50 ||
      o2 < 90
    ) {
      return 'I';
    }

    if (
      temp > 39 || temp < 35.5 ||
      sistolica > 160 || sistolica < 100 ||
      fc > 110 || fc < 60 ||
      fr > 24 || fr < 12 ||
      o2 < 92
    ) {
      return 'II';
    }

    if (
      temp > 38.5 ||
      sistolica > 140 || sistolica < 110 ||
      fc > 100 ||
      fr > 22 || fr < 14 ||
      o2 < 94
    ) {
      return 'III';
    }

    if (
      temp > 37.5 ||
      sistolica > 130 ||
      fc > 90
    ) {
      return 'IV';
    }

    return 'V';
  };

  const handleEvaluate = async () => {
    const triage = calculateTriage();
    setTriageResult(triage);

    try {
      let patientId = null;

      try {
        const checkPatientResponse = await patientService.getByIdentification(patientData!.identificacion);
        if (checkPatientResponse.data.success) {
          patientId = checkPatientResponse.data.data._id;
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          const createPatientResponse = await patientService.create(patientData);
          if (createPatientResponse.data.success) {
            patientId = createPatientResponse.data.data._id;
          }
        } else {
          throw error;
        }
      }

      if (patientId) {
        const triageResponse = await triageService.create({
          patientId,
          vitalSigns,
          observaciones: ''
        });

        if (triageResponse.data.success) {
          const completeRecord = {
            patientData,
            vitalSigns,
            triageResult: triage,
            evaluationDate: new Date().toLocaleString('es-CO')
          };
          localStorage.setItem('lastEvaluation', JSON.stringify(completeRecord));

          setTimeout(() => {
            navigate('/resultado');
          }, 2000);
        } else {
          throw new Error(triageResponse.data.message || 'Error al crear la evaluación');
        }
      } else {
        throw new Error('No se pudo obtener o crear el paciente');
      }
    } catch (error) {
      console.error('Error guardando evaluación:', error);
      alert('Error al guardar la evaluación. Verifique la conexión con el servidor.');
      setTriageResult(null);
    }
  };

  if (!patientData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Cargando datos del paciente...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-l-4 border-red-600 pl-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 uppercase">Signos Vitales</h2>
        <p className="text-sm text-gray-600 mt-1">
          Paciente: <span className="font-semibold">{patientData.nombre}</span> - 
          ID: <span className="font-semibold">{patientData.identificacion}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            TEMPERATURA (°C):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={vitalSigns.temperatura}
              onChange={(e) => handleVitalSignsChange('temperatura', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <span className="flex items-center px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
              °C
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            PRESIÓN ARTERIAL (MMHG):
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={vitalSigns.presionSistolica}
              onChange={(e) => handleVitalSignsChange('presionSistolica', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <span className="text-2xl font-bold text-gray-400">/</span>
            <input
              type="text"
              value={vitalSigns.presionDiastolica}
              onChange={(e) => handleVitalSignsChange('presionDiastolica', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <span className="flex items-center px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
              mmHg
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            FRECUENCIA CARDÍACA (LPM):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={vitalSigns.frecuenciaCardiaca}
              onChange={(e) => handleVitalSignsChange('frecuenciaCardiaca', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <span className="flex items-center px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
              lpm
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            FRECUENCIA RESPIRATORIA (RPM):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={vitalSigns.frecuenciaRespiratoria}
              onChange={(e) => handleVitalSignsChange('frecuenciaRespiratoria', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <span className="flex items-center px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
              rpm
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            SATURACIÓN O₂ (%):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={vitalSigns.saturacionO2}
              onChange={(e) => handleVitalSignsChange('saturacionO2', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <span className="flex items-center px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
              %
            </span>
          </div>
        </div>

        {triageResult && (
          <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-600 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">RESULTADO DEL TRIAGE</h3>
                <p className="text-sm text-gray-600">Clasificación del paciente</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${
                    triageResult === 'I' ? 'text-red-700' :
                    triageResult === 'II' ? 'text-orange-600' :
                    triageResult === 'III' ? 'text-yellow-600' :
                    triageResult === 'IV' ? 'text-green-600' :
                    'text-blue-600'
                  }`}>
                    {triageResult}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 mt-1">
                    {triageResult === 'I' ? 'RESUCITACIÓN' :
                     triageResult === 'II' ? 'EMERGENCIA' :
                     triageResult === 'III' ? 'URGENCIA' :
                     triageResult === 'IV' ? 'URGENCIA MENOR' :
                     'NO URGENTE'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-4 pt-4">
          <button
            onClick={handleBack}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Atrás
          </button>
          <div className="flex gap-4">
            <button
              onClick={handleClear}
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Limpiar
            </button>
            <button
              onClick={handleEvaluate}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
            >
              Evaluar paciente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signos;