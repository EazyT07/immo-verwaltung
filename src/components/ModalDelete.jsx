function ModalDelete({ onCancel, onConfirm }) {
  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-sm modal-fullscreen-sm-down">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Löschen bestätigen</h5>
          </div>
          <div className="modal-body">
            <p>Möchten Sie diesen Datensatz wirklich löschen?</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>
              Abbrechen
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              Löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalDelete;
