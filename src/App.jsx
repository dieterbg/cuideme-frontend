import React, { useState } from 'react';
import './App.css';
import PatientListItem from './components/PatientListItem';
import ChatMessage from './components/ChatMessage';

// --- DADOS FICTÍCIOS (MOCK DATA) ---
// No futuro, isso virá do nosso backend
const mockPatients = [
  { id: 1, name: 'Ana Silva', phone: '(11) 98765-4321', hasAlert: true },
  { id: 2, name: 'Carlos Souza', phone: '(21) 91234-5678', hasAlert: false },
  { id: 3, name: 'Mariana Costa', phone: '(31) 95555-8888', hasAlert: false },
];

const mockMessages = {
  1: [ // Mensagens da Ana Silva (id: 1)
    { id: 101, sender: 'system', text: 'Olá, Ana! Como você se sentiu hoje?', timestamp: '09:00' },
    { id: 102, sender: 'patient', text: 'Olá. Hoje acordei com muita dor de cabeça.', timestamp: '09:05' },
    { id: 103, sender: 'system', text: 'Entendido. Você tomou sua medicação?', timestamp: '09:06' },
    { id: 104, sender: 'patient', text: 'Ainda não tomei.', timestamp: '09:07' },
  ],
  2: [ // Mensagens do Carlos Souza (id: 2)
    { id: 201, sender: 'system', text: 'Bom dia, Carlos! Lembre-se de medir sua pressão.', timestamp: '08:30' },
    { id: 202, sender: 'patient', text: 'Bom dia. Já medi, tudo certo!', timestamp: '08:32' },
  ],
  3: [], // Mariana não tem mensagens
};
// --- FIM DOS DADOS FICTÍCIOS ---


function App() {
  // 'useState' é um "Hook" do React para guardar o estado do componente.
  // Aqui, guardamos o ID do paciente que está selecionado no momento.
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const selectedPatientMessages = selectedPatientId ? mockMessages[selectedPatientId] : [];

  return (
    <div className="app-container">
      <header>
        <h1>Painel de Acompanhamento - Cuide.me</h1>
      </header>
      <main className="main-content">
        <aside className="patient-list">
          <h2>Pacientes</h2>
          {mockPatients.map(patient => (
            <PatientListItem
              key={patient.id}
              patient={patient}
              isSelected={patient.id === selectedPatientId}
              onSelect={setSelectedPatientId}
            />
          ))}
        </aside>
        <section className="chat-view">
          {selectedPatientId ? (
            <>
              {selectedPatientMessages.length > 0 ? (
                selectedPatientMessages.map(msg => <ChatMessage key={msg.id} message={msg} />)
              ) : (
                <p>Este paciente ainda não possui mensagens.</p>
              )}
            </>
          ) : (
            <p>Selecione um paciente para ver as mensagens.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
