const express = require('express');
const router = express.Router();

// --- DADOS DOS AGENTES ---
// Adicionamos 'custoProducao' (cj no artigo).
// O vendedor não aceitará menos que isso.
let agentesIA = [
    { 
        id: 1, 
        nome: "GPT-Coder V3", 
        tipo: "DevOps", 
        utilidadeMarginal: 3500.00, // Valor gerado (u)
        custoProducao: 1000.00,     // Custo mínimo (c)
        descricao: "Automatiza pipelines."
    },
    { 
        id: 2, 
        nome: "Visionary Artist", 
        tipo: "Imagem", 
        utilidadeMarginal: 1200.00, 
        custoProducao: 500.00,
        descricao: "Cria assets para jogos."
    },
    { 
        id: 3, 
        nome: "DataCruncher 9000", 
        tipo: "Dados", 
        utilidadeMarginal: 5000.00, 
        custoProducao: 4000.00, // Custo alto (hardware caro)
        descricao: "Previsão financeira."
    },
    { 
        id: 4, 
        nome: "Estagiário Bot", 
        tipo: "Geral", 
        utilidadeMarginal: 300.00, 
        custoProducao: 50.00,   // Muito barato de manter
        descricao: "Responde e-mails."
    }
];

// Função MWP: min(Utilidade, Orçamento)
function calcularMWP(utilidade, orcamento) {
    return Math.min(utilidade, orcamento);
}

// --- ROTAS ---

// GET: Recebe o orçamento via Query Param (?orcamento=2000)
router.get('/', (req, res) => {
    // Se não vier orçamento na URL, assume 0
    const orcamentoComprador = parseFloat(req.query.orcamento) || 0;

    const catalogo = agentesIA.map(agente => {
        const precoMWP = calcularMWP(agente.utilidadeMarginal, orcamentoComprador);
        
        // Regra do Artigo: Lucro deve ser >= 0 (Eq. 4)
        // Se o preço calculado for menor que o custo, o vendedor recusa.
        const viavelParaVenda = precoMWP >= agente.custoProducao;

        return {
            ...agente,
            precoVenda: viavelParaVenda ? precoMWP : agente.custoProducao, // Mostra o custo se não der pra vender
            podeComprar: viavelParaVenda,
            motivoBloqueio: viavelParaVenda ? null : "Oferta abaixo do custo de produção"
        };
    });

    res.status(200).json(catalogo);
});

// POST: Realiza a compra recebendo o orçamento no corpo da requisição
router.post('/:id/comprar', (req, res) => {
    const id = parseInt(req.params.id);
    const { orcamento } = req.body; // Recebe o orçamento do input do usuário
    
    const agente = agentesIA.find(a => a.id === id);

    if (!agente) return res.status(404).json({});

    const precoCalculado = calcularMWP(agente.utilidadeMarginal, orcamento);

    // Validação Final no Servidor (Segurança)
    if (precoCalculado < agente.custoProducao) {
        return res.status(400).json({ 
            status: "erro", 
            mensagem: `O vendedor recusou a oferta. O mínimo aceitável é R$ ${agente.custoProducao}.` 
        });
    }

    res.status(200).json({
        status: "sucesso",
        mensagem: `Negócio fechado via MWP!`,
        detalhes: {
            item: agente.nome,
            preco_final: precoCalculado,
            lucro_vendedor: precoCalculado - agente.custoProducao
        }
    });
});

module.exports = router;