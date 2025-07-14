function ModalForm({
  title,
  fields,
  formData,
  onChange,
  onClose,
  onSubmit,
  editingId,
}) {
  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-sm modal-fullscreen-sm-down">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {fields.map((field) => (
              <div className="mb-2" key={field.id}>
                <label className="form-label">{field.text}</label>
                <input
                  name={field.id}
                  className="form-control"
                  value={formData[field.id]}
                  onChange={onChange}
                />
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Abbrechen
            </button>
            <button className="btn btn-primary" onClick={onSubmit}>
              {editingId ? "Aktualisieren" : "Hinzufügen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalForm;
