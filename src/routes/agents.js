const express = require('express');
const router = express.Router();

// --- DADOS DOS AGENTES ---
let agentesIA = [
    { id: 1, nome: "GPT-Coder V3", tipo: "DevOps", utilidadeMarginal: 3500.00, custoProducao: 1000.00, descricao: "Automatiza pipelines." },
    { id: 2, nome: "Visionary Artist", tipo: "Imagem", utilidadeMarginal: 1200.00, custoProducao: 500.00, descricao: "Cria assets para jogos." },
    { id: 3, nome: "DataCruncher 9000", tipo: "Dados", utilidadeMarginal: 5000.00, custoProducao: 4000.00, descricao: "Previsão financeira." },
    { id: 4, nome: "Estagiário Bot", tipo: "Geral", utilidadeMarginal: 300.00, custoProducao: 50.00, descricao: "Responde e-mails." }
];

function calcularMWP(utilidade, orcamento) {
    return Math.min(utilidade, orcamento);
}

// --- ROTAS EXISTENTES ---
router.get('/', (req, res) => {
    const orcamentoComprador = parseFloat(req.query.orcamento) || 0;

    const catalogo = agentesIA.map(agente => {
        const precoMWP = calcularMWP(agente.utilidadeMarginal, orcamentoComprador);
        const viavelParaVenda = precoMWP >= agente.custoProducao;

        return {
            ...agente,
            precoVenda: viavelParaVenda ? precoMWP : agente.custoProducao,
            podeComprar: viavelParaVenda,
            motivoBloqueio: viavelParaVenda ? null : "Oferta abaixo do custo de produção"
        };
    });

    res.status(200).json(catalogo);
});

router.post('/:id/comprar', (req, res) => {
    const id = parseInt(req.params.id);
    const { orcamento } = req.body;
    const agente = agentesIA.find(a => a.id === id);

    if (!agente) return res.status(404).json({ mensagem: 'Agente não encontrado.' });

    const precoCalculado = calcularMWP(agente.utilidadeMarginal, orcamento);
    if (precoCalculado < agente.custoProducao) {
        return res.status(400).json({ mensagem: `O vendedor recusou a oferta. Mínimo aceitável: R$ ${agente.custoProducao}.` });
    }

    res.status(200).json({
        mensagem: `Negócio fechado via MWP!`,
        detalhes: {
            item: agente.nome,
            preco_final: precoCalculado,
            lucro_vendedor: precoCalculado - agente.custoProducao
        }
    });
});

// --- NOVAS ROTAS PARA O VENDEDOR ---

// Criar novo agente
router.post('/', (req, res) => {
    const { nome, tipo, utilidadeMarginal, custoProducao, descricao } = req.body;
    if (!nome || !tipo || !utilidadeMarginal || !custoProducao) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios: nome, tipo, utilidadeMarginal, custoProducao.' });
    }

    const novoAgente = {
        id: agentesIA.length ? Math.max(...agentesIA.map(a => a.id)) + 1 : 1,
        nome,
        tipo,
        utilidadeMarginal: parseFloat(utilidadeMarginal),
        custoProducao: parseFloat(custoProducao),
        descricao: descricao || ""
    };

    agentesIA.push(novoAgente);
    res.status(201).json({ mensagem: 'Agente adicionado com sucesso!', agente: novoAgente });
});

// Editar agente existente
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = agentesIA.findIndex(a => a.id === id);
    if (index === -1) return res.status(404).json({ mensagem: 'Agente não encontrado.' });

    const { nome, tipo, utilidadeMarginal, custoProducao, descricao } = req.body;
    agentesIA[index] = {
        ...agentesIA[index],
        nome: nome || agentesIA[index].nome,
        tipo: tipo || agentesIA[index].tipo,
        utilidadeMarginal: utilidadeMarginal ? parseFloat(utilidadeMarginal) : agentesIA[index].utilidadeMarginal,
        custoProducao: custoProducao ? parseFloat(custoProducao) : agentesIA[index].custoProducao,
        descricao: descricao || agentesIA[index].descricao
    };

    res.json({ mensagem: 'Agente atualizado com sucesso!', agente: agentesIA[index] });
});

// Remover agente
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = agentesIA.findIndex(a => a.id === id);
    if (index === -1) return res.status(404).json({ mensagem: 'Agente não encontrado.' });

    const removido = agentesIA.splice(index, 1);
    res.json({ mensagem: 'Agente removido com sucesso!', removido });
});

module.exports = router;