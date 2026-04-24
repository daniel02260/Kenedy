import './InfoModal.css';

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal = ({ onClose }: InfoModalProps) => {
  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="info-close-button" onClick={onClose}>&times;</button>

        <div className="info-modal-body">
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
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
