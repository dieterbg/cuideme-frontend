import React from 'react';
import './PatientListItem.css';

function PatientListItem({ patient, onSelect, isSelected }) {
  const itemClassName = `patient-item ${isSelected ? 'selected' : ''}`;
  
  return (
    // ### MUDANÇA ### O onSelect agora é chamado sem argumento, pois a função pai já sabe o ID
    <div className={itemClassName} onClick={onSelect}>
      <div className="patient-info">
        {/* ### MUDANÇA ### O nome do paciente agora é passado como prop */}
        <span className="patient-name">{patient.name}</span>
        <span className="patient-phone">{patient.phone_number}</span>
      </div>
      {/* ### MUDANÇA ### A lógica de alerta virá do backend no futuro. Por enquanto, removemos. */}
    </div>
  );
}

export default PatientListItem;
