import { useState, useEffect } from 'react';
import './App.css';
import PatientListItem from './components/PatientListItem';
import ChatMessage from './components/ChatMessage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); // Estado já existia, agora vamos usá-lo
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Busca a lista de pacientes (sem alterações aqui)
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
    setSelectedPatient(patient);
  };

  // Busca mensagens ao selecionar paciente (MODIFICADO)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedPatient) return;

      setLoading(true); // ### MUDANÇA 1: Ativa o loading
      setError(null);   // ### MUDANÇA 2: Limpa erros anteriores

      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/${selectedPatient.id}`);
        if (!response.ok) throw new Error("Erro ao buscar mensagens.");
        const data = await response.json();
        setMessages(data);
      } catch (e) {
        console.error("Erro ao carregar mensagens:", e);
        setError('Não foi possível carregar as mensagens deste paciente.');
      } finally {
        setLoading(false); // ### MUDANÇA 3: Desativa o loading (mesmo com erro)
      }
    };

    fetchMessages();
  }, [selectedPatient]);

  const handleToggleControl = async () => {
    // ... (sem alterações nesta função)
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

  const handleSendMessage = async (e) => {
    // ... (sem alterações nesta função)
    e.preventDefault();
    if (!newMessage.trim() || !selectedPatient) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/send/${selectedPatient.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newMessage }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar a mensagem.');
      }

      const sentMessage = await response.json();
      setMessages(prevMessages => [...prevMessages, sentMessage]);
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

      {/* ### MUDANÇA 4: Adicionada a div .chat-container para posicionamento relativo */}
      <div className="chat-container">
        {/* ### MUDANÇA 5: Renderização condicional para loading e error */}
        {loading && <div className="loading-spinner"></div>}
        {error && <div className="error-message">{error}</div>}

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
                {/* A lógica de mensagens aqui dentro não será afetada visualmente pelos loaders */}
                {messages.length === 0 && !loading ? (
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
    </div>
  );
}

export default App;