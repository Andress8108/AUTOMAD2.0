import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

function Registro() {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientData>({
    identificacion: '',
    nombre: '',
    edad: '',
    sexo: '',
    tipoSangre: '',
    alergias: '',
    enfermedadesBase: '',
    medicamentosActuales: '',
    motivoConsulta: '',
    acompanante: '',
    fechaHora: new Date().toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  });

  const handlePatientDataChange = (field: keyof PatientData, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value.toUpperCase() }));
  };

  const isFormValid = () => {
    return (
      patientData.identificacion.trim() !== '' &&
      patientData.nombre.trim() !== '' &&
      patientData.edad.trim() !== '' &&
      patientData.sexo.trim() !== '' &&
      patientData.tipoSangre.trim() !== '' &&
      patientData.motivoConsulta.trim() !== ''
    );
  };

  const handleContinue = () => {
    if (!isFormValid()) {
      alert('Por favor complete todos los campos obligatorios antes de continuar.');
      return;
    }
    
    // Save patient data to localStorage
    localStorage.setItem('patientData', JSON.stringify(patientData));
    
    // Navigate to vital signs page
    navigate('/signos');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div>
      <div className="border-l-4 border-red-600 pl-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 uppercase">Registro del Paciente</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              IDENTIFICACIÓN: <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="Cédula o documento"
              value={patientData.identificacion}
              onChange={(e) => handlePatientDataChange('identificacion', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.querySelector<HTMLInputElement>('input[name="nombre"]')?.focus();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              name="identificacion"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              NOMBRE: <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={patientData.nombre}
              onChange={(e) => handlePatientDataChange('nombre', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.querySelector<HTMLInputElement>('input[name="edad"]')?.focus();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              name="nombre"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                EDAD: <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Años"
                value={patientData.edad}
                onChange={(e) => handlePatientDataChange('edad', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document.querySelector<HTMLSelectElement>('select[name="sexo"]')?.focus();
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                name="edad"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SEXO: <span className="text-red-600">*</span>
              </label>
              <select
                value={patientData.sexo}
                onChange={(e) => handlePatientDataChange('sexo', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document.querySelector<HTMLSelectElement>('select[name="tipoSangre"]')?.focus();
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                name="sexo"
                required
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              TIPO DE SANGRE: <span className="text-red-600">*</span>
            </label>
            <select
              value={patientData.tipoSangre}
              onChange={(e) => handlePatientDataChange('tipoSangre', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.querySelector<HTMLInputElement>('input[name="alergias"]')?.focus();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              name="tipoSangre"
              required
            >
              <option value="">Seleccionar</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ALERGIAS:
            </label>
            <input
              type="text"
              placeholder="Medicamentos, alimentos, etc."
              value={patientData.alergias}
              onChange={(e) => handlePatientDataChange('alergias', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.querySelector<HTMLInputElement>('input[name="enfermedadesBase"]')?.focus();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              name="alergias"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ENFERMEDADES BASE:
            </label>
            <input
              type="text"
              placeholder="Diabetes, hipertensión, etc."
              value={patientData.enfermedadesBase}
              onChange={(e) => handlePatientDataChange('enfermedadesBase', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.querySelector<HTMLInputElement>('input[name="medicamentosActuales"]')?.focus();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              name="enfermedadesBase"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              MEDICAMENTOS ACTUALES:
            </label>
            <input
              type="text"
              placeholder="Medicinas que consume regularmente"
              value={patientData.medicamentosActuales}
              onChange={(e) => handlePatientDataChange('medicamentosActuales', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.querySelector<HTMLInputElement>('input[name="motivoConsulta"]')?.focus();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              name="medicamentosActuales"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              MOTIVO DE CONSULTA: <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="Síntomas o razón de la visita"
              value={patientData.motivoConsulta}
              onChange={(e) => handlePatientDataChange('motivoConsulta', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.querySelector<HTMLInputElement>('input[name="acompanante"]')?.focus();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              name="motivoConsulta"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ACOMPAÑANTE:
            </label>
            <input
              type="text"
              placeholder="Nombre del acompañante (si aplica)"
              value={patientData.acompanante}
              onChange={(e) => handlePatientDataChange('acompanante', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              name="acompanante"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              FECHA/HORA:
            </label>
            <input
              type="text"
              value={patientData.fechaHora}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleBack}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors mr-4"
          >
            Volver al Inicio
          </button>
          <p className="text-sm text-gray-600 mr-4 flex items-center">
            <span className="text-red-600 mr-1">*</span> Campos obligatorios
          </p>
          <button
            onClick={handleContinue}
            disabled={!isFormValid()}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg ${
              isFormValid()
                ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Registro;