const express = require('express');
const cors = require('cors'); // IMPORTANTE: Importa o cors

// Importa as rotas de agentes
const agentsRoutes = require('./routes/agents');

const app = express();

// --- Middlewares ---
app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json());

// --- ADICIONE ESTA LINHA ---
// Ela diz para o servidor servir os arquivos da pasta 'public'
app.use(express.static('public'));

// --- Rotas da API ---

// Rota base (Health Check)
app.get('/', (req, res) => {
    res.status(200).json({ mensagem: "Marketplace API Online" });
});

// Registra as rotas de agentes sob o prefixo '/api/agentes'
app.use('/api/agentes', agentsRoutes);


module.exports = app;