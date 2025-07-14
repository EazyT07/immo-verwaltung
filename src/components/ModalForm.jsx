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
            {fields.map((field, index) => (
              <div className="mb-2" key={`field-${field.id || index}`}>
                <label
                  className="form-label"
                  htmlFor={`field-${field.id || index}`}
                >
                  {field.text}
                </label>
                {field.type === "select" ? (
                  <select
                    id={`field-${field.id || index}`}
                    name={field.id}
                    className="form-control"
                    value={formData[field.id] || ""}
                    onChange={onChange}
                  >
                    <option value="">Bitte wählen</option>
                    {field.options?.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.ext_id || opt.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`field-${field.id || index}`}
                    name={field.id}
                    className="form-control"
                    value={formData[field.id] ?? ""}
                    onChange={onChange}
                  />
                )}
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
