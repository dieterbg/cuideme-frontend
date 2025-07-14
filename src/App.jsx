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

  // Função para buscar a lista de pacientes
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

  // Busca os pacientes quando o app carrega
  useEffect(() => {
    fetchPatients();
  }, []);

  // Função para lidar com a seleção de um paciente na lista
  const handleSelectPatient = (patient) => {
    console.log("Paciente clicado. Definindo como selecionado:", patient);
    
    // Define o paciente selecionado imediatamente para a UI responder.
    setSelectedPatient(patient);
    
    // Limpa as mensagens antigas e mostra o estado de carregamento.
    setMessages([]);
    setLoading(true);
    setError(null);

    // Função interna para buscar as mensagens do paciente selecionado.
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/${patient.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMessages(data);
        // Após buscar, atualiza a lista de pacientes para limpar o indicador de alerta.
        await fetchPatients();
      } catch (e) {
        console.error("Erro ao buscar mensagens:", e);
        setError('Não foi possível carregar as mensagens.');
      } finally {
        setLoading(false);
      }
    };

    // Chama a função para buscar as mensagens.
    fetchMessages();
  };

  // Função para alternar o controle da conversa (manual/automático)
  const handleToggleControl = async () => {
    if (!selectedPatient) return;
    const isAssuming = selectedPatient.status === 'automatico';
    const endpoint = isAssuming ? 'assume-control' : 'release-control';
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/${selectedPatient.id}/${endpoint}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Falha ao alterar o modo de controle.');
      
      // Busca a lista de pacientes atualizada do servidor.
      const freshPatients = await (await fetch(`${API_BASE_URL}/api/patients`)).json();
      setPatients(freshPatients);
      
      // Encontra o paciente atualizado na nova lista e o define como selecionado.
      const updatedPatientFromList = freshPatients.find(p => p.id === selectedPatient.id);
      if (updatedPatientFromList) {
          setSelectedPatient(updatedPatientFromList);
      }
    } catch (e) {
      console.error("Erro ao alterar controle:", e);
      setError('Não foi possível alterar o controle.');
    }
  };

  // Função para lidar com o envio de uma nova mensagem (a ser implementada)
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

  // Lógica para o texto dinâmico do botão de controle
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
              {loading && <p>Carregando mensagens...</p>}
              {error && <p className="error">{error}</p>}
              {!loading && messages.length === 0 && <p>Este paciente ainda não possui mensagens.</p>}
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
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
