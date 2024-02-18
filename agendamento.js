document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-agendamento');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        enviarAgendamento();
    });

    carregarAgendamentos();
});

function enviarAgendamento() {
    const nomeCliente = document.getElementById('nomeCliente').value;
    const procedimentos = Array.from(document.getElementById('procedimentos').selectedOptions).map(option => option.value);
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;

    const agendamentoData = {
        nomeCliente,
        procedimentos,
        data,
        horario
    };

    fetch('https://studiolilian-production.up.railway.app/api/agendamentos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(agendamentoData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha ao realizar agendamento');
        }
        return response.json();
    })
    .then(data => {
        console.log('Agendamento realizado com sucesso:', data);
        // Exibir modal de sucesso após o agendamento bem-sucedido
        $('#modalSucesso').modal('show');
        carregarAgendamentos(); // Recarrega a lista de agendamentos
    })
    .catch((error) => {
        console.error('Erro ao fazer agendamento:', error);
    });
}

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
                    <td>${agendamento.nomeCliente}</td>
                    <td>${agendamento.procedimentos.join(', ')}</td>
                    <td>${agendamento.data}</td>
                    <td>${agendamento.horario}</td>
                `;
                agendamentosBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Erro ao carregar agendamentos:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    const dataInput = document.getElementById('data');
    const dataAtual = new Date().toISOString().split('T')[0];
    dataInput.setAttribute('min', dataAtual);
});
