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
          <img
            src="/img/logo_universidad.png?v=2"
            alt="Logo Universidad Uniagustiniana"
            className="uni-logo"
          />
          <h2>Acerca de este Proyecto</h2>
          <p>
            Este mapa interactivo transmedia de la localidad de Kennedy es un espacio
            diseñado para explorar y conocer los diferentes puntos de interés,
            resaltando su cultura, ecosistema y valor social.
          </p>
          <p>
            Proyecto desarrollado con el apoyo de la <strong>Uniagustiniana</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
