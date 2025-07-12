import React from 'react';
import './PatientListItem.css'; // Vamos criar este arquivo de estilo a seguir

function PatientListItem({ patient, onSelect, isSelected }) {
  // Determina a classe CSS com base se o paciente está selecionado
  const itemClassName = `patient-item ${isSelected ? 'selected' : ''}`;
  
  return (
    <div className={itemClassName} onClick={() => onSelect(patient.id)}>
      <div className="patient-info">
        <span className="patient-name">{patient.name}</span>
        <span className="patient-phone">{patient.phone}</span>
      </div>
      {/* Mostra um indicador de alerta se houver novas mensagens de alerta */}
      {patient.hasAlert && <div className="alert-indicator">!</div>}
    </div>
  );
}

export default PatientListItem;
