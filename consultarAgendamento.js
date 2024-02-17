document.addEventListener('DOMContentLoaded', function() {
    carregarAgendamentos();

    // Adicione um ouvinte de eventos para o botão de salvar
    document.getElementById('btnSalvarEdicao').addEventListener('click', function() {
        enviarAtualizacaoAgendamento();
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
            return response;
        })
        .then(() => {
            console.log('Agendamento excluído com sucesso');
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

function filtrarPorMes(mesSelecionado) {
    // Obtém todos os agendamentos da tabela
    const agendamentos = document.querySelectorAll('#agendamentos-body tr');

    // Verifica se um mês foi selecionado
    if (mesSelecionado) {
        // Itera sobre os agendamentos e exibe apenas aqueles do mês selecionado
        agendamentos.forEach(agendamento => {
            const dataAgendamento = agendamento.querySelector('td:nth-child(4)').textContent;
            const mesAgendamento = new Date(dataAgendamento).getMonth() + 1; // Extrai o mês da data e ajusta para começar de 1

            if (mesAgendamento !== parseInt(mesSelecionado)) {
                agendamento.style.display = 'none'; // Oculta o agendamento se não for do mês selecionado
            } else {
                agendamento.style.display = ''; // Exibe o agendamento se for do mês selecionado
            }
        });
    } else {
        // Se nenhum mês for selecionado, exibe todos os agendamentos novamente
        agendamentos.forEach(agendamento => {
            agendamento.style.display = '';
        });
    }
}
