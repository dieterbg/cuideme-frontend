import { useState, useEffect } from 'react';
import './App.css';
import PatientListItem from './components/PatientListItem';
import ChatMessage from './components/ChatMessage';
import SummaryModal from './components/SummaryModal'; // NOVO

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // NOVOS ESTADOS PARA O MODAL E SUMARIZAÇÃO
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // ... (fetchPatients, handleSelectPatient, useEffect de fetchMessages e de WebSocket permanecem os mesmos)
  // Busca a lista de pacientes (sem alterações)
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

  // Busca mensagens ao selecionar paciente (sem alterações)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedPatient) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/${selectedPatient.id}`);
        if (!response.ok) throw new Error("Erro ao buscar mensagens.");
        const data = await response.json();
        setMessages(data);
      } catch (e) {
        console.error("Erro ao carregar mensagens:", e);
        setError('Não foi possível carregar as mensagens deste paciente.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedPatient]);
  
  // useEffect para gerenciar a conexão WebSocket (sem alterações)
  useEffect(() => {
    if (!selectedPatient) return;

    // Converte a URL http(s) para ws(s)
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
    
    const ws = new WebSocket(`${wsUrl}/ws/${selectedPatient.id}`);

    ws.onopen = () => {
      console.log(`Conexão WebSocket aberta para o paciente ${selectedPatient.id}`);
    };

    ws.onmessage = (event) => {
      console.log("Mensagem recebida via WebSocket:", event.data);
      const messageData = JSON.parse(event.data);
      // Adiciona a nova mensagem ao estado, garantindo que não seja duplicada
      setMessages(prevMessages => {
          if (prevMessages.some(msg => msg.id === messageData.id)) {
              return prevMessages;
          }
          return [...prevMessages, messageData];
      });
    };

    ws.onclose = () => {
      console.log(`Conexão WebSocket fechada para o paciente ${selectedPatient.id}`);
    };

    ws.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
    };

    // Função de limpeza: fecha a conexão ao trocar de paciente ou desmontar o componente
    return () => {
      ws.close();
    };
  }, [selectedPatient]);

  // ### NOVA FUNÇÃO PARA GERAR O RESUMO ###
  const handleSummarize = async () => {
    if (!selectedPatient) return;

    setIsSummarizing(true);
    setIsSummaryModalOpen(true); // Abre o modal imediatamente para mostrar o loader
    setSummaryContent(''); // Limpa o conteúdo anterior
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${selectedPatient.id}/summarize`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Falha ao gerar o resumo.');
      }
      const data = await response.json();
      setSummaryContent(data.summary);

    } catch (e) {
      console.error("Erro ao sumarizar:", e);
      setSummaryContent(`Ocorreu um erro: ${e.message}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  // ... (handleToggleControl e handleSendMessage permanecem os mesmos)
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

  const handleSendMessage = async (e) => {
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

      <div className="chat-container">
        {loading && <div className="loading-spinner"></div>}
        {error && <div className="error-message">{error}</div>}

        <div className="chat-view">
          {!selectedPatient ? (
            <div className="chat-view placeholder">Selecione um paciente para ver a conversa.</div>
          ) : (
            <>
              {/* HEADER MODIFICADO PARA INCLUIR O BOTÃO DE RESUMO */}
              <header className="chat-header">
                <h2>{selectedPatient.name || selectedPatient.phone_number}</h2>
                <div className="header-buttons">
                  <button onClick={handleSummarize} className="control-button summarize-button" disabled={isSummarizing}>
                    {isSummarizing ? 'Gerando...' : 'Resumir com IA'}
                  </button>
                  <button onClick={handleToggleControl} className="control-button">
                    {controlButtonText}
                  </button>
                </div>
              </header>

              <div className="messages-list">
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
      
      {/* RENDERIZAÇÃO CONDICIONAL DO MODAL */}
      {isSummaryModalOpen && (
        <SummaryModal 
          summary={summaryContent}
          isLoading={isSummarizing}
          onClose={() => setIsSummaryModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;