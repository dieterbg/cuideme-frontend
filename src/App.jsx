import { useState, useEffect } from 'react';
import './App.css';
import PatientListItem from './components/PatientListItem';
import ChatMessage from './components/ChatMessage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Busca a lista de pacientes
  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPatients(data);
    } catch (e) {
      console.error("Erro ao buscar pacientes:", e);
      setError('Não foi possível carregar os pacientes.');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSelectPatient = (patient) => {
    console.log("--- TESTE ---");
    console.log("Paciente clicado:", patient);
    setSelectedPatient(patient);
    console.log("Estado 'selectedPatient' foi atualizado. A UI deveria re-renderizar agora.");
  };

  // Busca mensagens ao selecionar paciente
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedPatient) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/${selectedPatient.id}`);
        if (!response.ok) throw new Error("Erro ao buscar mensagens.");
        const data = await response.json();
        setMessages(data);
      } catch (e) {
        console.error("Erro ao carregar mensagens:", e);
        setError('Não foi possível carregar as mensagens.');
      }
    };

    fetchMessages();
  }, [selectedPatient]);

  const handleToggleControl = async () => {
    if (!selectedPatient) return;
    const isAssuming = selectedPatient.status === 'automatico';
    const endpoint = isAssuming ? 'assume-control' : 'release-control';

    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/${selectedPatient.id}/${endpoint}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Falha ao alterar o modo de controle.');

      const freshPatients = await (await fetch(`${API_BASE_URL}/api/patients`)).json();
      setPatients(freshPatients);

      const updatedPatientFromList = freshPatients.find(p => p.id === selectedPatient.id);
      if (updatedPatientFromList) {
        setSelectedPatient(updatedPatientFromList);
      }
    } catch (e) {
      console.error("Erro ao alterar controle:", e);
      setError('Não foi possível alterar o controle.');
    }
  };

// VERSÃO ANTIGA (com alert)
/*
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!newMessage.trim() || !selectedPatient) return;
  try {
    alert(`Funcionalidade de envio a ser implementada. Mensagem: ${newMessage}`);
    setNewMessage('');
  } catch (e) {
    console.error("Erro ao enviar mensagem:", e);
    setError('Não foi possível enviar a mensagem.');
  }
};
*/

// ### NOVA VERSÃO (com chamada à API) ###
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!newMessage.trim() || !selectedPatient) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/messages/send/${selectedPatient.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newMessage }), // Envia o texto da mensagem no corpo
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar a mensagem.');
    }

    const sentMessage = await response.json(); // A API retorna a mensagem salva

    // Adiciona a nova mensagem à lista de mensagens na tela imediatamente
    setMessages(prevMessages => [...prevMessages, sentMessage]);
    
    // Limpa a caixa de texto
    setNewMessage('');

  } catch (e) {
    console.error("Erro ao enviar mensagem:", e);
    setError('Não foi possível enviar a mensagem.');
  }
};


  const isManualMode = selectedPatient?.status === 'manual';
  const controlButtonText = isManualMode ? 'Encerrar Conversa' : 'Assumir Conversa';

  return (
    <div className="app-container">
      <PatientListItem
        patients={patients}
        selectedPatientId={selectedPatient?.id}
        onSelectPatient={handleSelectPatient}
      />

      <div className="chat-view">
        {!selectedPatient ? (
          <div className="chat-view placeholder">Selecione um paciente para ver a conversa.</div>
        ) : (
          <>
            <header className="chat-header">
              <h2>{selectedPatient.name || selectedPatient.phone_number}</h2>
              <button onClick={handleToggleControl} className="control-button">
                {controlButtonText}
              </button>
            </header>

            <div className="messages-list">
              {messages.length === 0 ? (
                <p>Nenhuma mensagem encontrada.</p>
              ) : (
                messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))
              )}
            </div>

            {isManualMode && (
              <footer className="chat-footer">
                <form onSubmit={handleSendMessage} className="message-form">
                  <input
                    type="text"
                    className="message-input"
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="send-button">Enviar</button>
                </form>
              </footer>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
