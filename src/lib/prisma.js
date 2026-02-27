const { PrismaClient } = require('@prisma/client');

// Na versão 7+, passamos a URL diretamente no construtor
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

module.exports = prisma;