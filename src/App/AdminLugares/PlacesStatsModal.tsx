import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

interface PlacesStatsModalProps {
  onClose: () => void;
}

// Sub-componente del gráfico de líneas SVG interactivo
interface LineChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

const LineChart = ({ labels, datasets }: LineChartProps) => {
  const svgWidth = 520;
  const svgHeight = 180;
  const padLeft = 35;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 25;
  
  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;
  
  // Encontrar el valor máximo de todos los conjuntos de datos para escalar el eje Y
  let maxVal = 0;
  datasets.forEach(dataset => {
    dataset.data.forEach(val => {
      if (val > maxVal) maxVal = val;
    });
  });
  if (maxVal === 0) maxVal = 5; // Altura mínima de escala por defecto si todo es 0
  
  // Generar etiquetas de marca para el eje Y (0%, 33%, 66%, 100%)
  const yAxisTicksCount = 4;
  const yTicks = Array.from({ length: yAxisTicksCount }, (_, i) => Math.round((maxVal / (yAxisTicksCount - 1)) * i));

  const numPoints = labels.length;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ overflow: 'visible', background: '#fdfbf7', borderRadius: '8px', padding: '10px 5px' }}>
        {/* Bandas verticales alternadas (Estilo rejilla visual premium como la referencia del usuario) */}
        {numPoints > 1 && Array.from({ length: numPoints - 1 }).map((_, i) => {
          if (i % 2 === 0) return null;
          const x1 = padLeft + (i / (numPoints - 1)) * chartWidth;
          const x2 = padLeft + ((i + 1) / (numPoints - 1)) * chartWidth;
          return (
            <rect
              key={i}
              x={x1}
              y={padTop}
              width={x2 - x1}
              height={chartHeight}
              fill="rgba(74, 56, 39, 0.04)"
            />
          );
        })}

        {/* Líneas horizontales de cuadrícula y marcas Y */}
        {yTicks.map((tick, i) => {
          const y = padTop + chartHeight - (tick / maxVal) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={padLeft}
                y1={y}
                x2={padLeft + chartWidth}
                y2={y}
                stroke="rgba(74, 56, 39, 0.12)"
                strokeDasharray="4,4"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                fontFamily="'Inter', sans-serif"
                fontSize="0.7rem"
                fill="#6e5a47"
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Eje X - Etiquetas en la parte inferior */}
        {labels.map((label, i) => {
          const x = padLeft + (i / (numPoints - 1)) * chartWidth;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={padTop + chartHeight}
                x2={x}
                y2={padTop + chartHeight + 4}
                stroke="rgba(74, 56, 39, 0.2)"
              />
              <text
                x={x}
                y={padTop + chartHeight + 16}
                fontFamily="'Playfair Display', serif"
                fontSize="0.75rem"
                fontWeight="bold"
                fill="#2c2018"
                textAnchor="middle"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Dibujar las líneas de datos y sus nodos */}
        {datasets.map((dataset, dsIdx) => {
          const pointsStr = dataset.data.map((val, i) => {
            const x = padLeft + (i / (numPoints - 1)) * chartWidth;
            const y = padTop + chartHeight - (val / maxVal) * chartHeight;
            return `${x},${y}`;
          }).join(' ');

          return (
            <g key={dsIdx}>
              {/* Línea conectora */}
              <polyline
                fill="none"
                stroke={dataset.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsStr}
                style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.12))' }}
              />

              {/* Círculos con nodos en cada punto */}
              {dataset.data.map((val, i) => {
                const x = padLeft + (i / (numPoints - 1)) * chartWidth;
                const y = padTop + chartHeight - (val / maxVal) * chartHeight;
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill={dataset.color}
                      stroke="#fff"
                      strokeWidth="1.2"
                      style={{ cursor: 'pointer' }}
                    />
                    <title>{`${dataset.label}: ${val} en ${labels[i]}`}</title>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Leyenda de la gráfica */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginTop: '10px',
        justifyContent: 'center'
      }}>
        {datasets.map((dataset, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: dataset.color,
              display: 'inline-block'
            }} />
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#503d2b'
            }}>
              {dataset.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper para generar el SVG del gráfico optimizado en tamaño para el PDF (1 sola hoja)
const getSVGHtmlForPrint = (labels: string[], datasets: any[]) => {
  const svgWidth = 600;
  const svgHeight = 145; // Altura reducida para garantizar el ajuste exacto en 1 sola hoja
  const padLeft = 35;
  const padRight = 15;
  const padTop = 10;
  const padBottom = 22;
  
  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;
  
  let maxVal = 0;
  datasets.forEach(dataset => {
    dataset.data.forEach((val: number) => {
      if (val > maxVal) maxVal = val;
    });
  });
  if (maxVal === 0) maxVal = 5;
  
  const yAxisTicksCount = 4;
  const yTicks = Array.from({ length: yAxisTicksCount }, (_, i) => Math.round((maxVal / (yAxisTicksCount - 1)) * i));
  const numPoints = labels.length;

  let bandsHtml = "";
  if (numPoints > 1) {
    for (let i = 0; i < numPoints - 1; i++) {
      if (i % 2 === 1) {
        const x1 = padLeft + (i / (numPoints - 1)) * chartWidth;
        const x2 = padLeft + ((i + 1) / (numPoints - 1)) * chartWidth;
        bandsHtml += `<rect x="${x1}" y="${padTop}" width="${x2 - x1}" height="${chartHeight}" fill="rgba(74, 56, 39, 0.04)" />`;
      }
    }
  }

  let yTicksHtml = "";
  yTicks.forEach(tick => {
    const y = padTop + chartHeight - (tick / maxVal) * chartHeight;
    yTicksHtml += `
      <line x1="${padLeft}" y1="${y}" x2="${padLeft + chartWidth}" y2="${y}" stroke="rgba(74, 56, 39, 0.12)" stroke-dasharray="4,4" />
      <text x="${padLeft - 6}" y="${y + 3}" font-family="'Inter', sans-serif" font-size="9px" fill="#6e5a47" text-anchor="end">${tick}</text>
    `;
  });

  let xLabelsHtml = "";
  labels.forEach((label, i) => {
    const x = padLeft + (i / (numPoints - 1)) * chartWidth;
    xLabelsHtml += `
      <line x1="${x}" y1="${padTop + chartHeight}" x2="${x}" y2="${padTop + chartHeight + 3}" stroke="rgba(74, 56, 39, 0.2)" />
      <text x="${x}" y="${padTop + chartHeight + 13}" font-family="'Playfair Display', serif" font-size="10px" font-weight="bold" fill="#2c2018" text-anchor="middle">${label}</text>
    `;
  });

  let linesHtml = "";
  datasets.forEach(dataset => {
    const pointsStr = dataset.data.map((val: number, i: number) => {
      const x = padLeft + (i / (numPoints - 1)) * chartWidth;
      const y = padTop + chartHeight - (val / maxVal) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    let nodesHtml = "";
    dataset.data.forEach((val: number, i: number) => {
      const x = padLeft + (i / (numPoints - 1)) * chartWidth;
      const y = padTop + chartHeight - (val / maxVal) * chartHeight;
      nodesHtml += `<circle cx="${x}" cy="${y}" r="3.5" fill="${dataset.color}" stroke="#fff" stroke-width="1" />`;
    });

    linesHtml += `
      <polyline fill="none" stroke="${dataset.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pointsStr}" />
      ${nodesHtml}
    `;
  });

  return `
    <svg width="100%" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="background: #fdfbf7; border-radius: 6px; border: 1px solid rgba(74, 56, 39, 0.12); padding: 5px; box-sizing: border-box;">
      ${bandsHtml}
      ${yTicksHtml}
      ${xLabelsHtml}
      ${linesHtml}
    </svg>
  `;
};

const PlacesStatsModal = ({ onClose }: PlacesStatsModalProps) => {
  const { 
    points, 
    pointStats, 
    weeklyHistory = { visits: [0, 0, 0, 0, 0, 0, 0], chatbot: [0, 0, 0, 0, 0, 0, 0] },
    monthlyHistory = { visits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], chatbot: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');
  const [chartMetric, setChartMetric] = useState<'places' | 'weekly' | 'monthly'>('places');

  // Encontrar el lugar más preguntado en el chatbot
  let mostAskedPoint = null;
  let maxQueries = -1;

  points.forEach(point => {
    const stats = pointStats[point.id] || { chatbotQueries: 0 };
    if (stats.chatbotQueries > maxQueries) {
      maxQueries = stats.chatbotQueries;
      mostAskedPoint = point;
    }
  });

  // Configurar etiquetas y conjuntos de datos para el gráfico de líneas según la métrica activa
  let chartLabels: string[] = [];
  let chartDatasets: { label: string; data: number[]; color: string; }[] = [];

  if (chartMetric === 'places') {
    chartLabels = points.map((_, idx) => `P${idx + 1}`);
    chartDatasets = [
      {
        label: 'Visitas Diarias',
        data: points.map(p => pointStats[p.id]?.daily || 0),
        color: '#0fbcf9' // Cyan
      },
      {
        label: 'Consultas Chatbot',
        data: points.map(p => pointStats[p.id]?.chatbotQueries || 0),
        color: '#ff9f43' // Naranja
      }
    ];
  } else if (chartMetric === 'weekly') {
    chartLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    chartDatasets = [
      {
        label: 'Visitas Reales',
        data: weeklyHistory.visits,
        color: '#0fbcf9'
      },
      {
        label: 'Consultas Chatbot',
        data: weeklyHistory.chatbot,
        color: '#ff9f43'
      }
    ];
  } else {
    chartLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    chartDatasets = [
      {
        label: 'Visitas Reales',
        data: monthlyHistory.visits,
        color: '#0fbcf9'
      },
      {
        label: 'Consultas Chatbot',
        data: monthlyHistory.chatbot,
        color: '#ff9f43'
      }
    ];
  }

  // Función para descargar la métrica activa como un PDF Formal en 1 Sola Hoja con Logos Acoplados
  const downloadMetricsPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor, permite las ventanas emergentes para poder generar el PDF del reporte.");
      return;
    }

    const todayStr = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Rutas absolutas para resolver imágenes en caliente local y producción
    const logoExplora = window.location.origin + '/img/LOGO_EXPLORA_kENNEDY.png';
    const logoUniversidad = window.location.origin + '/img/logo_universidad.png';

    let reportTitle = "";
    let contentHtml = "";

    if (activeTab === 'table') {
      reportTitle = "Reporte de Tráfico y Datos de Lugares";
      contentHtml += `
        <h3 class="section-title">Resumen Estadístico Detallado</h3>
        <table>
          <thead>
            <tr>
              <th>Lugar de Interés</th>
              <th class="center">Visitas Diarias</th>
              <th class="center">Visitas Semanales</th>
              <th class="center">Visitas Mensuales</th>
              <th class="center">Preguntas Chatbot</th>
            </tr>
          </thead>
          <tbody>
            ${points.map(point => {
              const stats = pointStats[point.id] || { daily: 0, weekly: 0, monthly: 0, chatbotQueries: 0 };
              return `
                <tr>
                  <td><strong>${point.name}</strong></td>
                  <td class="center">${stats.daily}</td>
                  <td class="center">${stats.weekly}</td>
                  <td class="center">${stats.monthly}</td>
                  <td class="center highlight">${stats.chatbotQueries}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else {
      if (chartMetric === 'places') {
        reportTitle = "Gráfica Diaria - Comparativa por Lugar";
        contentHtml += `
          <h3 class="section-title">Tendencia de Tráfico del Día</h3>
          <div class="chart-container">
            ${getSVGHtmlForPrint(chartLabels, chartDatasets)}
          </div>
          
          <div class="legend-box">
            <h4>Leyenda de Lugares</h4>
            <div class="legend-grid">
              ${points.map((p, idx) => `
                <div><strong>P${idx + 1}:</strong> ${p.name}</div>
              `).join('')}
            </div>
          </div>

          <h3 class="section-title" style="margin-top: 15px;">Datos del Gráfico</h3>
          <table>
            <thead>
              <tr>
                <th>Lugar de Interés</th>
                <th class="center">Visitas Diarias</th>
                <th class="center">Preguntas Chatbot</th>
              </tr>
            </thead>
            <tbody>
              ${points.map(point => {
                const stats = pointStats[point.id] || { daily: 0, chatbotQueries: 0 };
                return `
                  <tr>
                    <td><strong>${point.name}</strong></td>
                    <td class="center">${stats.daily}</td>
                    <td class="center highlight">${stats.chatbotQueries}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;
      } else if (chartMetric === 'weekly') {
        reportTitle = "Gráfica Semanal - Tendencia por Días";
        contentHtml += `
          <h3 class="section-title">Comportamiento del Tráfico por Día de la Semana</h3>
          <div class="chart-container">
            ${getSVGHtmlForPrint(chartLabels, chartDatasets)}
          </div>

          <h3 class="section-title" style="margin-top: 15px;">Datos del Gráfico</h3>
          <table>
            <thead>
              <tr>
                <th>Día de la Semana</th>
                <th class="center">Visitas Reales</th>
                <th class="center">Preguntas Chatbot</th>
              </tr>
            </thead>
            <tbody>
              ${['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, idx) => `
                <tr>
                  <td><strong>${day}</strong></td>
                  <td class="center">${weeklyHistory.visits[idx] || 0}</td>
                  <td class="center highlight">${weeklyHistory.chatbot[idx] || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      } else {
        reportTitle = "Gráfica Mensual - Tendencia por Meses";
        contentHtml += `
          <h3 class="section-title">Comportamiento del Tráfico a lo Largo del Año</h3>
          <div class="chart-container">
            ${getSVGHtmlForPrint(chartLabels, chartDatasets)}
          </div>

          <h3 class="section-title" style="margin-top: 15px;">Datos del Gráfico</h3>
          <table>
            <thead>
              <tr>
                <th>Mes del Año</th>
                <th class="center">Visitas Reales</th>
                <th class="center">Preguntas Chatbot</th>
              </tr>
            </thead>
            <tbody>
              ${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, idx) => `
                <tr>
                  <td><strong>${month}</strong></td>
                  <td class="center">${monthlyHistory.visits[idx] || 0}</td>
                  <td class="center highlight">${monthlyHistory.chatbot[idx] || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte Kennedy - ${reportTitle}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet">
        <style>
          /* Estructura optimizada para ocupar estrictamente 1 hoja */
          @page {
            size: portrait;
            margin: 6mm 10mm; /* Oculta cabeceras nativas de fecha y URL de navegadores */
          }
          body {
            font-family: 'Inter', sans-serif;
            background: #fff;
            color: #2c2018;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .report-container {
            border: 2px solid #503d2b;
            padding: 18px 22px;
            background: #fdfbf7;
            position: relative;
            border-radius: 8px;
            box-sizing: border-box;
          }
          .report-container::before {
            content: "";
            position: absolute;
            top: 4px;
            left: 4px;
            right: 4px;
            bottom: 4px;
            border: 1px dashed rgba(80, 61, 43, 0.4);
            pointer-events: none;
            border-radius: 6px;
          }
          /* Nueva cabecera con logo MÁS GRANDE a la izquierda */
          .header {
            display: flex;
            align-items: center;
            gap: 20px;
            border-bottom: 2px solid #503d2b;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .logo-img {
            height: 75px; /* ¡Aumentado de 52px a 75px para mayor impacto visual! */
            max-width: 220px;
            object-fit: contain;
          }
          .header-text {
            text-align: left;
          }
          .header-text h1 {
            font-family: 'Playfair Display', serif;
            font-size: 1.7rem;
            color: #503d2b;
            margin: 0;
            font-weight: 700;
          }
          .header-text h2 {
            font-size: 0.85rem;
            color: #d1562b;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 3px 0 0 0;
            font-weight: 600;
          }
          .metadata-card {
            background: rgba(80, 61, 43, 0.04);
            border: 1px solid rgba(80, 61, 43, 0.12);
            border-radius: 6px;
            padding: 8px 16px;
            margin-bottom: 12px;
            font-size: 0.8rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px 12px;
          }
          .metadata-card div strong {
            color: #503d2b;
          }
          .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.1rem;
            color: #503d2b;
            border-bottom: 1.2px solid rgba(80, 61, 43, 0.2);
            padding-bottom: 3px;
            margin: 12px 0 6px 0;
          }
          .chart-container {
            margin: 8px 0;
            background: #fff;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid rgba(80, 61, 43, 0.1);
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
            font-size: 0.8rem;
          }
          th {
            background: #503d2b;
            color: #fffaf0;
            font-family: 'Playfair Display', serif;
            font-size: 0.88rem;
            padding: 7px 10px;
            text-align: left;
            border: 1px solid #503d2b;
          }
          td {
            padding: 6px 10px;
            border: 1px solid rgba(80, 61, 43, 0.12);
          }
          tr:nth-child(even) {
            background: rgba(80, 61, 43, 0.02);
          }
          .center {
            text-align: center;
          }
          .highlight {
            color: #d1562b;
            font-weight: bold;
          }
          .legend-box {
            background: #fff;
            border: 1px solid rgba(80, 61, 43, 0.1);
            border-radius: 6px;
            padding: 8px 12px;
            margin-top: 6px;
          }
          .legend-box h4 {
            margin: 0 0 4px 0;
            font-family: 'Playfair Display', serif;
            color: #503d2b;
            font-size: 0.85rem;
          }
          .legend-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 4px;
            font-size: 0.72rem;
            color: #6e5a47;
          }
          .footer {
            margin-top: 18px;
            border-top: 1px solid rgba(80, 61, 43, 0.15);
            padding-top: 10px;
            text-align: center;
            font-size: 0.7rem;
            color: #8c7660;
            line-height: 1.3;
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <!-- Carga el logo Explora Kennedy y si falla carga el de la universidad -->
            <img src="${logoExplora}" alt="Logo" class="logo-img" onerror="this.onerror=null; this.src='${logoUniversidad}';" />
            <div class="header-text">
              <h1>Reporte de Analítica</h1>
              <h2>Impacto y Estadísticas del Sistema Kennedy</h2>
            </div>
          </div>
          
          <div class="metadata-card">
            <div><strong>Tipo de Reporte:</strong> ${reportTitle}</div>
            <div><strong>Fecha de Emisión:</strong> ${todayStr}</div>
            <div><strong>Generado por:</strong> Administrador de Sistema Kennedy</div>
            <div><strong>Entorno de Operación:</strong> Producción Real</div>
          </div>

          ${contentHtml}

          <div class="footer">
            SISTEMA INTEGRAL DE INFORMACIÓN TURÍSTICA Y CULTURAL (SIITC) DE KENNEDY<br>
            Bogotá D.C., Colombia &bull; Reporte oficial generado por sistema para fines académicos y de control local.
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 800);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlTemplate);
    printWindow.document.close();
  };

  return (
    <div className="admin-add-place-overlay" onClick={onClose}>
      <div 
        className="admin-add-place-modal manage-places-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', width: '90%' }}
      >
        <button className="auth-close-btn" onClick={onClose} title="Cerrar">&times;</button>
        
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: '#503d2b', marginBottom: '8px' }}>
          📊 Datos e Impacto de Lugares
        </h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#6e5a47', marginBottom: '20px' }}>
          Estadísticas de interacción recopiladas de las visitas en el mapa y consultas de usuarios en el chatbot.
        </p>

        {/* Banner destacado: Lugar más preguntado */}
        {mostAskedPoint && maxQueries > 0 && (
          <div style={{
            background: '#fcf3e3',
            border: '2px dashed #d1562b',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            boxShadow: 'inset 0 0 10px rgba(209, 86, 43, 0.05)'
          }}>
            <div style={{ fontSize: '2rem' }}>🔥</div>
            <div>
              <h4 style={{ margin: 0, fontFamily: "'Playfair Display', serif", color: '#d1562b', fontSize: '1.05rem', fontWeight: 700 }}>
                Lugar Más Consultado en el Chatbot
              </h4>
              <p style={{ margin: '4px 0 0 0', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#2c2018' }}>
                <strong>{(mostAskedPoint as any).name}</strong> lidera el interés público con <strong style={{ color: '#d1562b', fontSize: '1.05rem' }}>{maxQueries} preguntas</strong> directas a nuestra Inteligencia Artificial.
              </p>
            </div>
          </div>
        )}

        {/* Selector de Pestañas (Tabla vs Gráfico) */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '15px',
          background: 'rgba(74, 56, 39, 0.08)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid rgba(74, 56, 39, 0.15)'
        }}>
          <button
            onClick={() => setActiveTab('table')}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              borderRadius: '6px',
              fontFamily: "'Playfair Display', serif",
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'table' ? '#503d2b' : 'transparent',
              color: activeTab === 'table' ? '#fffaf0' : '#503d2b',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'table' ? '0 2px 6px rgba(0, 0, 0, 0.15)' : 'none',
              outline: 'none'
            }}
          >
            📋 Tabla de Datos
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              borderRadius: '6px',
              fontFamily: "'Playfair Display', serif",
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'chart' ? '#503d2b' : 'transparent',
              color: activeTab === 'chart' ? '#fffaf0' : '#503d2b',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'chart' ? '0 2px 6px rgba(0, 0, 0, 0.15)' : 'none',
              outline: 'none'
            }}
          >
            📈 Gráfica de Tendencia
          </button>
        </div>

        {/* Contenedor Principal de Datos */}
        <div style={{
          height: '320px',
          overflowY: 'auto',
          border: '1px solid rgba(74, 56, 39, 0.3)',
          borderRadius: '8px',
          padding: '15px',
          background: '#f5eedf',
          boxShadow: 'inset 0 0 20px rgba(105, 61, 22, 0.05)',
          boxSizing: 'border-box'
        }}>
          {points.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6e5a47', fontFamily: "'Inter', sans-serif", padding: '20px 0' }}>
              No hay lugares registrados para mostrar estadísticas.
            </p>
          ) : activeTab === 'table' ? (
            /* VISTA DE TABLA */
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: "'Playfair Display', serif",
              color: '#2c2018'
            }}>
              <thead>
                <tr style={{ borderBottom: '2.5px solid #4a3827', textAlign: 'left' }}>
                  <th style={{ padding: '8px 4px', fontSize: '0.95rem' }}>Lugar</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center', fontSize: '0.95rem' }}>Diario</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center', fontSize: '0.95rem' }}>Semanal</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center', fontSize: '0.95rem' }}>Mensual</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center', fontSize: '0.95rem', color: '#d1562b' }}>Chatbot 💬</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}>
                {points.map((point) => {
                  const stats = pointStats[point.id] || { daily: 0, weekly: 0, monthly: 0, chatbotQueries: 0 };
                  return (
                    <tr key={point.id} style={{ borderBottom: '1px dashed rgba(74, 56, 39, 0.3)' }}>
                      <td style={{ padding: '12px 4px', fontWeight: '600', fontFamily: "'Playfair Display', serif", fontSize: '0.95rem' }}>
                        {point.name}
                      </td>
                      <td style={{ padding: '12px 4px', textAlign: 'center', color: '#555' }}>
                        {stats.daily}
                      </td>
                      <td style={{ padding: '12px 4px', textAlign: 'center', color: '#555' }}>
                        {stats.weekly}
                      </td>
                      <td style={{ padding: '12px 4px', textAlign: 'center', color: '#2c2018', fontWeight: '600' }}>
                        {stats.monthly}
                      </td>
                      <td style={{ padding: '12px 4px', textAlign: 'center', color: '#d1562b', fontWeight: 'bold' }}>
                        {stats.chatbotQueries}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* VISTA DE GRÁFICO DE TENDENCIAS (MULTILÍNEA ESTILO IMAGEN) */
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Selector interno de vista temporal de la gráfica */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '15px',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(74, 56, 39, 0.15)'
              }}>
                {[
                  { key: 'places', label: 'Diario 📅 (Por Lugares)' },
                  { key: 'weekly', label: 'Semanal 📆 (Días con Visita)' },
                  { key: 'monthly', label: 'Mensual 🌳 (Meses del Año)' }
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setChartMetric(m.key as any)}
                    style={{
                      flex: 1,
                      padding: '8px 6px',
                      border: '1px solid',
                      borderColor: chartMetric === m.key ? '#503d2b' : 'rgba(74, 56, 39, 0.2)',
                      borderRadius: '20px',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: chartMetric === m.key ? '#503d2b' : '#fcfaf6',
                      color: chartMetric === m.key ? '#fffaf0' : '#503d2b',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Dibujar la gráfica de líneas */}
              <LineChart labels={chartLabels} datasets={chartDatasets} />

              {/* Leyenda de Lugares para mantener la gráfica limpia */}
              {chartMetric === 'places' && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px 10px',
                  background: 'rgba(74, 56, 39, 0.05)',
                  borderRadius: '6px',
                  border: '1px solid rgba(74, 56, 39, 0.12)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '4px 10px',
                  maxHeight: '60px',
                  overflowY: 'auto'
                }}>
                  {points.map((p, idx) => (
                    <div key={p.id} style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#503d2b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong style={{ color: '#d1562b' }}>P{idx + 1}:</strong> {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={downloadMetricsPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: '#d1562b',
              border: 'none',
              borderRadius: '8px',
              fontFamily: "'Playfair Display', serif",
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#fffaf0',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(209, 86, 43, 0.25)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#b8441d';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#d1562b';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📄 Descargar en PDF
          </button>
          
          <button 
            className="sidebar-btn-map" 
            onClick={onClose}
            style={{ width: '130px', margin: 0 }}
          >
            Cerrar datos
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacesStatsModal;
