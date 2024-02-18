// Adicione um evento de clique ao botão "Mostrar Atendimentos do Dia"
const btnMostrarAtendimentos = document.querySelector('.btn-atendimentos');
btnMostrarAtendimentos.addEventListener('click', function() {
    // Chame a função para obter os agendamentos do dia
    obterAgendamentosDoDia();
});

// Função para obter os agendamentos do dia atual
function obterAgendamentosDoDia() {
    const dataAtual = new Date().toISOString().split('T')[0]; // Obtém a data atual no formato AAAA-MM-DD
    const url = `https://studiolilian-production.up.railway.app/api/agendamentos?data=${dataAtual}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao carregar os agendamentos do dia');
            }
            return response.json();
        })
        .then(agendamentos => {
            // Construa o conteúdo do modal com base nos agendamentos recebidos
            const modalBody = document.querySelector('.modal-body');
            modalBody.innerHTML = '';

            agendamentos.forEach(agendamento => {
                const divAgendamento = document.createElement('div');
                divAgendamento.textContent = `${agendamento.nomeCliente} - ${agendamento.horario}`;
                modalBody.appendChild(divAgendamento);
            });

            // Abra o modal para exibir os agendamentos
            $('#modalAtendimentosDoDia').modal('show');
        })
        .catch(error => console.error('Erro ao obter os agendamentos do dia:', error));
}
