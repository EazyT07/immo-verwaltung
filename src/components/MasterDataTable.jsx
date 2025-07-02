import React from "react";

function MasterDataTable({ columns = [], data = [], onEdit, onDelete }) {
  return (
    <div class="table-responsive">
      <table className="table table-striped table-bordered table-hover">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              <td>
                {onEdit && (
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => onEdit(row)}
                    title="Bearbeiten"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                )}
                {onDelete && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(row.id)}
                    title="Löschen"
                  >
                    <i className="bi bi-trash3"></i>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MasterDataTable;
