import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, CheckCircle, User, Calendar, Heart, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

interface EvaluationRecord {
  patientData: PatientData;
  vitalSigns: VitalSigns;
  triageResult: string;
  evaluationDate: string;
}

function Resultado() {
  const navigate = useNavigate();
  const [evaluationRecord, setEvaluationRecord] = useState<EvaluationRecord | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    // Load evaluation record from localStorage
    const savedEvaluation = localStorage.getItem('lastEvaluation');
    if (savedEvaluation) {
      setEvaluationRecord(JSON.parse(savedEvaluation));
    } else {
      // If no evaluation data, redirect to registration
      navigate('/');
    }
  }, [navigate]);

  const getTriageInfo = (triage: string) => {
    switch (triage) {
      case 'I':
        return {
          level: 'I',
          name: 'RESUCITACIÓN',
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          priority: 'CRÍTICO - Atención inmediata',
          time: 'Inmediato'
        };
      case 'II':
        return {
          level: 'II',
          name: 'EMERGENCIA',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          priority: 'MUY URGENTE - Atención en 10 minutos',
          time: '10 minutos'
        };
      case 'III':
        return {
          level: 'III',
          name: 'URGENCIA',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          priority: 'URGENTE - Atención en 60 minutos',
          time: '60 minutos'
        };
      case 'IV':
        return {
          level: 'IV',
          name: 'URGENCIA MENOR',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          priority: 'MENOS URGENTE - Atención en 120 minutos',
          time: '120 minutos'
        };
      case 'V':
        return {
          level: 'V',
          name: 'NO URGENTE',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          priority: 'NO URGENTE - Atención en 240 minutos',
          time: '240 minutos'
        };
      default:
        return {
          level: '?',
          name: 'DESCONOCIDO',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          priority: 'Sin clasificar',
          time: 'N/A'
        };
    }
  };

  const generatePDF = async () => {
    if (!evaluationRecord) return;

    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Add watermark background
      pdf.setGState(pdf.GState({opacity: 0.1}));
      pdf.setFontSize(60);
      pdf.setTextColor(150, 150, 150);
      pdf.text('SAVISER', pageWidth/2, pageHeight/2, {align: 'center', angle: 45});
      pdf.setGState(pdf.GState({opacity: 1}));
      
      // Header with logo and clinic info
      const currentDate = new Date().toLocaleDateString('es-CO');
      const currentTime = new Date().toLocaleTimeString('es-CO', {hour12: false});
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${currentDate}. ${currentTime}`, margin, 15);
      pdf.text('Sistema SAVISER v1.0', pageWidth - margin, 15, {align: 'right'});
      
      // Main title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SISTEMA SAVISER', pageWidth/2, 35, {align: 'center'});
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Sistema de Clasificación de Triage', pageWidth/2, 42, {align: 'center'});
      pdf.text('Registro Médico Electrónico', pageWidth/2, 48, {align: 'center'});
      
      // Horizontal line
      pdf.setLineWidth(0.5);
      pdf.line(margin, 55, pageWidth - margin, 55);
      
      let yPosition = 70;
      
      // Triage Classification - Prominent display
      const triageInfo = getTriageInfo(evaluationRecord.triageResult);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CLASIFICACIÓN TRIAGE', margin, yPosition);
      
      // Triage level box
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition + 5, contentWidth, 25, 'F');
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`NIVEL ${triageInfo.level}`, margin + 10, yPosition + 18);
      pdf.setFontSize(12);
      pdf.text(`${triageInfo.name}`, margin + 60, yPosition + 18);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${triageInfo.priority}`, margin + 10, yPosition + 25);
      
      yPosition += 40;
      
      // Dashed line separator
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      pdf.setLineDashPattern([], 0);
      
      yPosition += 10;
      
      // DATOS PERSONALES section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATOS PERSONALES', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const personalData = [
        ['Paciente:', evaluationRecord.patientData.nombre],
        ['Identificación:', evaluationRecord.patientData.identificacion],
        ['Edad:', `${evaluationRecord.patientData.edad} años`],
        ['Sexo:', evaluationRecord.patientData.sexo],
        ['Tipo de Sangre:', evaluationRecord.patientData.tipoSangre],
        ['Acompañante:', evaluationRecord.patientData.acompanante || 'N/A']
      ];
      
      personalData.forEach(([label, value]) => {
        pdf.text(label, margin, yPosition);
        pdf.text(value, margin + 40, yPosition);
        yPosition += 6;
      });
      
      yPosition += 5;
      
      // Dashed line separator
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      pdf.setLineDashPattern([], 0);
      
      yPosition += 10;
      
      // I. DATOS DE INGRESO
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('I. DATOS DE INGRESO', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Motivo de Ingreso:', margin, yPosition);
      yPosition += 6;
      pdf.text(evaluationRecord.patientData.motivoConsulta, margin + 5, yPosition);
      yPosition += 10;
      
      // II. ANTECEDENTES
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('II. ANTECEDENTES', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      if (evaluationRecord.patientData.alergias) {
        pdf.text('Alergias:', margin, yPosition);
        pdf.text(evaluationRecord.patientData.alergias, margin + 25, yPosition);
        yPosition += 6;
      }
      
      pdf.text('ANTECEDENTES PERSONALES PATOLÓGICOS', margin, yPosition);
      yPosition += 6;
      
      if (evaluationRecord.patientData.enfermedadesBase) {
        pdf.text(evaluationRecord.patientData.enfermedadesBase, margin + 5, yPosition);
        yPosition += 6;
      }
      
      if (evaluationRecord.patientData.medicamentosActuales) {
        pdf.text('Medicamentos Actuales:', margin, yPosition);
        pdf.text(evaluationRecord.patientData.medicamentosActuales, margin + 5, yPosition + 6);
        yPosition += 12;
      }
      
      yPosition += 5;
      
      // Dashed line separator
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      pdf.setLineDashPattern([], 0);
      
      yPosition += 10;
      
      // III. SIGNOS VITALES
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('III. SIGNOS VITALES AL INGRESO', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const vitalSigns = [
        ['T.A', `${evaluationRecord.vitalSigns.presionSistolica}/${evaluationRecord.vitalSigns.presionDiastolica}`],
        ['FC', evaluationRecord.vitalSigns.frecuenciaCardiaca],
        ['FR', evaluationRecord.vitalSigns.frecuenciaRespiratoria],
        ['T:', `${evaluationRecord.vitalSigns.temperatura}°C`],
        ['SO₂', `${evaluationRecord.vitalSigns.saturacionO2}%`]
      ];
      
      let xPos = margin;
      vitalSigns.forEach(([label, value], index) => {
        pdf.text(`${label} ${value}`, xPos, yPosition);
        xPos += 35;
        if (index === 2) {
          xPos = margin;
          yPosition += 6;
        }
      });
      
      yPosition += 15;
      
      // Dashed line separator
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      pdf.setLineDashPattern([], 0);
      
      yPosition += 10;
      
      // IV. EVALUACIÓN DE TRIAGE
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IV. EVALUACIÓN DE TRIAGE', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Clasificación: Nivel ${triageInfo.level} - ${triageInfo.name}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Tiempo máximo de espera: ${triageInfo.time}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Fecha de evaluación: ${evaluationRecord.evaluationDate}`, margin, yPosition);
      
      yPosition += 15;
      
      // Dashed line separator
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      pdf.setLineDashPattern([], 0);
      
      yPosition += 10;
      
      // V. OBSERVACIONES
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('V. OBSERVACIONES', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Evaluación realizada mediante Sistema SAVISER', margin, yPosition);
      yPosition += 6;
      pdf.text('Clasificación automática basada en signos vitales y protocolos médicos', margin, yPosition);
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Sistema SAVISER - Registro generado automáticamente', pageWidth/2, pageHeight - 10, {align: 'center'});

      const fileName = `Triage_${evaluationRecord.patientData.nombre.replace(/\s+/g, '_')}_${evaluationRecord.patientData.identificacion}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleNewPatient = () => {
    // Clear localStorage and navigate to registration
    localStorage.removeItem('patientData');
    localStorage.removeItem('lastEvaluation');
    navigate('/');
  };

  const handleBackToVitalSigns = () => {
    navigate('/signos');
  };

  if (!evaluationRecord) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Cargando resultado de evaluación...</p>
        </div>
      </div>
    );
  }

  const triageInfo = getTriageInfo(evaluationRecord.triageResult);

  return (
    <div>
      <div className="border-l-4 border-green-600 pl-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 uppercase">Resultado Final del Triage</h2>
        <p className="text-sm text-gray-600 mt-1">
          Evaluación completada - {evaluationRecord.evaluationDate}
        </p>
      </div>

      {/* Success Confirmation */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <div>
          <p className="font-semibold text-green-800">Registro guardado correctamente</p>
          <p className="text-sm text-green-600">La evaluación del paciente ha sido procesada exitosamente</p>
        </div>
      </div>

      <div id="evaluation-summary" className="bg-white p-6">
        {/* Triage Result Card */}
        <div className={`p-6 rounded-lg border-2 ${triageInfo.borderColor} ${triageInfo.bgColor} mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">CLASIFICACIÓN TRIAGE</h3>
              <p className="text-lg font-semibold text-gray-700">{triageInfo.priority}</p>
              <p className="text-sm text-gray-600 mt-1">Tiempo máximo de espera: {triageInfo.time}</p>
            </div>
            <div className="text-center">
              <div className={`text-8xl font-bold ${triageInfo.color} mb-2`}>
                {triageInfo.level}
              </div>
              <div className={`text-lg font-bold ${triageInfo.color}`}>
                {triageInfo.name}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h4 className="text-lg font-bold text-gray-800">DATOS DEL PACIENTE</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Nombre:</span>
                <span className="text-gray-800">{evaluationRecord.patientData.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Identificación:</span>
                <span className="text-gray-800">{evaluationRecord.patientData.identificacion}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Edad:</span>
                <span className="text-gray-800">{evaluationRecord.patientData.edad} años</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Sexo:</span>
                <span className="text-gray-800">{evaluationRecord.patientData.sexo}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Tipo de Sangre:</span>
                <span className="text-gray-800">{evaluationRecord.patientData.tipoSangre}</span>
              </div>
              {evaluationRecord.patientData.alergias && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">Alergias:</span>
                  <span className="text-gray-800">{evaluationRecord.patientData.alergias}</span>
                </div>
              )}
              {evaluationRecord.patientData.enfermedadesBase && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">Enfermedades Base:</span>
                  <span className="text-gray-800">{evaluationRecord.patientData.enfermedadesBase}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-600" />
              <h4 className="text-lg font-bold text-gray-800">SIGNOS VITALES</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Temperatura:</span>
                <span className="text-gray-800">{evaluationRecord.vitalSigns.temperatura}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Presión Arterial:</span>
                <span className="text-gray-800">
                  {evaluationRecord.vitalSigns.presionSistolica}/{evaluationRecord.vitalSigns.presionDiastolica} mmHg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Frecuencia Cardíaca:</span>
                <span className="text-gray-800">{evaluationRecord.vitalSigns.frecuenciaCardiaca} lpm</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Frecuencia Respiratoria:</span>
                <span className="text-gray-800">{evaluationRecord.vitalSigns.frecuenciaRespiratoria} rpm</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Saturación O₂:</span>
                <span className="text-gray-800">{evaluationRecord.vitalSigns.saturacionO2}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Details */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-bold text-gray-800">DETALLES DE LA CONSULTA</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Motivo de Consulta:</span>
              <span className="text-gray-800">{evaluationRecord.patientData.motivoConsulta}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Fecha de Registro:</span>
              <span className="text-gray-800">{evaluationRecord.patientData.fechaHora}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Fecha de Evaluación:</span>
              <span className="text-gray-800">{evaluationRecord.evaluationDate}</span>
            </div>
            {evaluationRecord.patientData.acompanante && (
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Acompañante:</span>
                <span className="text-gray-800">{evaluationRecord.patientData.acompanante}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
        <div className="flex gap-4">
          <button
            onClick={handleBackToVitalSigns}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Volver a Signos Vitales
          </button>
          <button
            onClick={handleNewPatient}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Nuevo Paciente
          </button>
        </div>
        
        <button
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg ${
            isGeneratingPDF
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isGeneratingPDF ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Generando PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Generar PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Resultado;