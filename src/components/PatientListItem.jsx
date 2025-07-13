import React from 'react';
import './PatientListItem.css';

function PatientListItem({ patient, onSelect, isSelected }) {
  const itemClassName = `patient-item ${isSelected ? 'selected' : ''}`;
  
  return (
    <div className={itemClassName} onClick={onSelect}>
      <div className="patient-info">
        {/* Usa o número de telefone como nome principal se o nome for nulo */}
        <span className="patient-name">{patient.name || patient.phone_number}</span>
        {/* Mostra o número de telefone como info secundária apenas se o nome existir */}
        {patient.name && <span className="patient-phone">{patient.phone_number}</span>}
      </div>
      
      {/* ### MUDANÇA ### Reintroduz o indicador de alerta, agora com dados reais */}
      {patient.has_alert && <div className="alert-indicator">!</div>}
    </div>
  );
}

export default PatientListItem;
