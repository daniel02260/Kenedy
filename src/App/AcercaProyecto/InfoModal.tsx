import { useState } from 'react';
import './InfoModal.css';

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal = ({ onClose }: InfoModalProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'credits'>('info');

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="info-close-button" onClick={onClose}>&times;</button>

        <div className="info-modal-scroll-area">
          <div className="info-tabs">
            <button
              className={`info-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Acerca de
            </button>
            <button
              className={`info-tab-btn ${activeTab === 'credits' ? 'active' : ''}`}
              onClick={() => setActiveTab('credits')}
            >
              Créditos
            </button>
          </div>

          <div className="info-modal-body">
            {activeTab === 'info' ? (
              <>
                <a href="https://www.uniagustiniana.edu.co" target="_blank" rel="noopener noreferrer" className="uni-link-logo">
                  <img
                    src="/img/logo_universidad.png?v=2"
                    alt="Logo Universidad Uniagustiniana"
                    className="uni-logo"
                  />
                </a>
                <h2>Acerca de este Proyecto</h2>
                <p>
                  Este proyecto transmedia es un mapa interactivo de la localidad de Kennedy
                  que permite explorar sus puntos de interés, resaltando su riqueza cultural,
                  ambiental y social.
                </p>
                <p>
                  Desarrollado en el marco de la carrera de Cine y Televisión de la <a href="https://www.uniagustiniana.edu.co" target="_blank" rel="noopener noreferrer" className="uni-link-text"><strong>Uniagustiniana</strong></a>.
                </p>
              </>
            ) : (
              <>
                <div className="credits-list">
                  <div className='credit-item developer-credit'>
                    <strong>Ingeniero desarrollador de plataforma</strong>
                    <div className="developer-profile">
                      <img src="/img/daniel_nomelin.jpg" alt="Daniel Nomelin" className="credit-photo" />
                      <span>DANIEL NOMELIN OVIEDO</span>
                      {/* --- Y javierntnt(https://github.com/javierntnt) basura --- */}
                    </div>
                  </div>

                  <div className="credit-item">
                    <strong>Director Unidad de Proyección Social Uniagustiniana</strong>
                    <span>FERNANDO SÁNCHEZ TORRES</span>
                  </div>
                  <div className="credit-item">
                    <strong>Decana Facultad Arte, Comunicación y Cultura</strong>
                    <span>PAOLA LADINO MARÍN</span>
                  </div>
                  <div className="credit-item">
                    <strong>Directora Programas Académicos Cine y Televisión, y Comunicación Social</strong>
                    <span>ANA LUCÍA ACUÑA</span>
                  </div>
                  <div className="credit-item">
                    <strong>Autor del proyecto</strong>
                    <span>CHRISTIAN ÁVILA</span>
                  </div>
                  <div className="credit-item">
                    <strong>Líder del Proyecto</strong>
                    <span>JAVIER ZAMBRANO LUNA</span>
                    <span className="credit-subrole">Docente Programa Cine y Televisión</span>
                  </div>
                  <div className="credit-item">
                    <strong>Colíder del Proyecto</strong>
                    <span>MARÍA DEL PILAR GÓMEZ</span>
                    <span className="credit-subrole">Docente Programa Comunicación Social</span>
                  </div>
                  <div className="credit-item">
                    <strong>Supervisor de Desarrollo de Software</strong>
                    <span>Ingeniero RAMIRO OSORIO</span>
                  </div>
                  <div className="credit-item">
                    <strong>Docentes colaboradores</strong>
                    <span>RODOLFO PRADA PENAGOS <br /> GABRIEL DUARTE</span>
                    <span className="credit-subrole">Programa de Comunicación Social</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
