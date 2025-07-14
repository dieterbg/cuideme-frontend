import React from 'react';
import './PatientList.css';

function PatientList({ patients, selectedPatientId, onSelectPatient }) {
  return (
    <aside className="patient-list">
      <header>
        <h1>Pacientes</h1>
      </header>
      <ul>
        {patients.map((patient) => (
          <li
            key={patient.id}
            className={patient.id === selectedPatientId ? 'selected' : ''}
            onClick={() => onSelectPatient(patient)}
          >
            <div className="patient-info">
              <span className="patient-name">{patient.name || patient.phone_number}</span>
              {patient.has_alert && <span className="alert-indicator">!</span>}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default PatientList;
