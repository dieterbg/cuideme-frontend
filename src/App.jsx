import React, { useState, useEffect } from 'react'; // ### MUDANÇA ### Importa o useEffect
import './App.css';
import PatientListItem from './components/PatientListItem';
import ChatMessage from './components/ChatMessage';

// ### MUDANÇA ### A URL base da nossa API vem do arquivo .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ### MUDANÇA ### REMOVEMOS COMPLETAMENTE OS DADOS FICTÍCIOS (mockPatients e mockMessages )

function App() {
  // ### MUDANÇA ### Criamos mais estados para gerenciar os dados e o carregamento
  const [patients, setPatients] = useState([]); // Armazenará a lista de pacientes vinda da API
  const [messages, setMessages] = useState([]); // Armazenará as mensagens do paciente selecionado
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Para mostrar um feedback de "carregando"

  // ### MUDANÇA ### useEffect para buscar a lista de pacientes quando o componente carrega
  useEffect(() => {
    // Define uma função assíncrona para buscar os dados
    const fetchPatients = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/patients`);
        if (!response.ok) {
          throw new Error('Falha ao buscar pacientes');
        }
        const data = await response.json();
        setPatients(data); // Atualiza o estado com os pacientes da API
      } catch (error) {
        console.error("Erro:", error);
        // Aqui você poderia definir um estado de erro para mostrar na tela
      }
    };

    fetchPatients(); // Executa a função
  }, []); // O array vazio `[]` significa que este efeito roda apenas uma vez, quando o componente é montado

  // ### MUDANÇA ### Função para lidar com a seleção de um paciente
  const handleSelectPatient = async (patientId) => {
    setSelectedPatientId(patientId);
    setIsLoading(true); // Ativa o indicador de carregamento
    setMessages([]); // Limpa as mensagens antigas

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${patientId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar mensagens');
      }
      const data = await response.json();
      setMessages(data); // Atualiza o estado com as novas mensagens
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setIsLoading(false); // Desativa o indicador de carregamento, mesmo se der erro
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Painel de Acompanhamento - Cuide.me</h1>
      </header>
      <main className="main-content">
        <aside className="patient-list">
          <h2>Pacientes</h2>
          {/* ### MUDANÇA ### Mapeia a lista de pacientes do estado, não mais do mock */}
          {patients.map(patient => (
            <PatientListItem
              key={patient.id}
              patient={{...patient, name: patient.name || patient.phone_number}} // Usa o número se o nome for nulo
              isSelected={patient.id === selectedPatientId}
              onSelect={() => handleSelectPatient(patient.id)} // ### MUDANÇA ### Chama a nova função
            />
          ))}
        </aside>
        <section className="chat-view">
          {/* ### MUDANÇA ### Lógica de exibição melhorada com estado de carregamento */}
          {isLoading ? (
            <p>Carregando mensagens...</p>
          ) : selectedPatientId ? (
            <>
              {messages.length > 0 ? (
                messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
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
