document.addEventListener('DOMContentLoaded', function() {
    carregarAgendamentos();

    // Adicione um ouvinte de eventos para o botão de salvar
    document.getElementById('btnSalvarEdicao').addEventListener('click', function() {
        enviarAtualizacaoAgendamento();
    });

    // Adiciona um ouvinte de eventos para o botão de "Ver Atendimentos do Dia"
    document.getElementById('btnAtendimentosDia').addEventListener('click', function() {
        buscarAtendimentosDoDia();
    });
});

function carregarAgendamentos() {
    fetch('https://studiolilian-production.up.railway.app/api/agendamentos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao carregar agendamentos');
            }
            return response.json();
        })
        .then(agendamentos => {
            const agendamentosBody = document.getElementById('agendamentos-body');
            agendamentosBody.innerHTML = '';

            agendamentos.forEach(agendamento => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${agendamento.id}</td>
                    <td>${agendamento.nomeCliente}</td>
                    <td>${mapearProcedimentos(agendamento.procedimentos).join(', ')}</td>
                    <td>${formatarData(agendamento.data)}</td>
                    <td>${agendamento.horario}</td>
                    <td>
                        <button data-id="${agendamento.id}" onclick="abrirFormularioEdicao(this)" class="btn btn-sm btn-primary rounded-circle bg-dark">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deletarAgendamento('${agendamento.id}')" class="btn btn-sm btn-danger rounded-circle bg-dark">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                agendamentosBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Erro ao carregar agendamentos:', error));
}

function mapearProcedimentos(procedimentos) {
    const mapeamento = {
        'designSobrancelhas': 'Design de Sobrancelhas',
        'designHenna': 'Design com Henna',
        // Adicione mais mapeamentos conforme necessário
    };

    return procedimentos.map(proc => mapeamento[proc] || proc);
}

function deletarAgendamento(id) {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
        fetch(`https://studiolilian-production.up.railway.app/api/agendamentos/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir o agendamento');
            }
            // Recarregue a página após a exclusão
            window.location.reload();
        })
        .catch(error => {
            console.error('Erro ao excluir o agendamento:', error);
        });
    }
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function abrirFormularioEdicao(button) {
    // Extrai o ID do agendamento do atributo data-id
    const idAgendamento = button.getAttribute('data-id');
    
    // Verifique se idAgendamento está definido
    if (idAgendamento) {
        fetch(`https://studiolilian-production.up.railway.app/api/agendamentos/${idAgendamento}`)
            .then(response => response.json())
            .then(agendamento => {
                document.getElementById('nomeClienteEdit').value = agendamento.nomeCliente;
                // Defina os procedimentos selecionados
                const procedimentosSelect = document.getElementById('procedimentosEdit');
                Array.from(procedimentosSelect.options).forEach(option => {
                    option.selected = agendamento.procedimentos.includes(option.value);
                });
                document.getElementById('dataEdit').value = agendamento.data; // Formato AAAA-MM-DD
                document.getElementById('horarioEdit').value = agendamento.horario; // Formato HH:MM

                // Aplicar máscaras aos procedimentos selecionados
                $('#procedimentosEdit').selectpicker('refresh');

                $('#modalEdicaoAgendamento').modal('show');

                // Ao abrir o formulário de edição, defina o ID do agendamento no campo oculto
                document.getElementById('idAgendamento').value = idAgendamento;
            })
            .catch(error => console.error('Erro ao buscar dados do agendamento:', error));
    } else {
        console.error('ID do agendamento não está definido.');
    }
}

function enviarAtualizacaoAgendamento() {
    // Obtenha o ID do agendamento do campo de entrada
    const idAgendamento = document.getElementById('idAgendamento').value;

    // Verifique se idAgendamento está definido e é um número positivo
    if (idAgendamento && !isNaN(idAgendamento) && idAgendamento > 0) {
        const agendamentoAtualizado = {
            nomeCliente: document.getElementById('nomeClienteEdit').value,
            procedimentos: Array.from(document.getElementById('procedimentosEdit').selectedOptions).map(option => option.value),
            data: document.getElementById('dataEdit').value,
            horario: document.getElementById('horarioEdit').value
        };

        fetch(`https://studiolilian-production.up.railway.app/api/agendamentos/${idAgendamento}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(agendamentoAtualizado)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao atualizar o agendamento');
            }
            // Feche o modal de edição
            $('#modalEdicaoAgendamento').modal('hide');

            // Recarregue a página após a atualização bem-sucedida
            window.location.reload();
        })
        .catch(error => {
            console.error('Erro na atualização do agendamento:', error.message);
        });
    } else {
        console.error('ID do agendamento inválido ou não definido.');
    }
}

function buscarAtendimentosDoDia() {
    // Obtém a data atual e adiciona um dia para considerar o fuso horário do servidor
    const dataAtual = new Date();
    dataAtual.setDate(dataAtual.getDate() + 1); // Adiciona um dia

    const dataFormatada = dataAtual.toISOString().split('T')[0]; // Obtém a data no formato AAAA-MM-DD

    fetch(`https://studiolilian-production.up.railway.app/api/agendamentos?data=${dataFormatada}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao carregar os agendamentos do dia');
            }
            return response.json();
        })
        .then(agendamentos => {
            // Aqui você pode exibir os agendamentos do dia em um modal ou como preferir
            console.log('Agendamentos do dia', agendamentos);
            alert('Agendamentos do dia: ' + JSON.stringify(agendamentos));
        })
        .catch(error => console.error('Erro ao carregar os agendamentos do dia:', error));
}
