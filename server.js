

const express = require('express');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { inserirMensagem } = require('./database');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.post(
  '/api/contato',
  [
    body('nome')
      .trim()
      .notEmpty().withMessage('O nome é obrigatório.')
      .isLength({ max: 150 }).withMessage('Nome muito longo.'),

    body('email')
      .trim()
      .notEmpty().withMessage('O e-mail é obrigatório.')
      .isEmail().withMessage('Informe um e-mail válido.')
      .normalizeEmail(),

    body('telefone')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 20 }).withMessage('Telefone inválido.'),

    body('servico')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 }),

    body('mensagem')
      .trim()
      .notEmpty().withMessage('A mensagem é obrigatória.')
      .isLength({ max: 2000 }).withMessage('Mensagem muito longa (máx. 2000 caracteres).'),
  ],
  (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(422).json({
        sucesso: false,
        erros: erros.array().map(e => e.msg),
      });
    }

    const { nome, email, telefone, servico, mensagem } = req.body;

    try {
      const resultado = inserirMensagem({ nome, email, telefone, servico, mensagem });

      console.log(`[API] Nova mensagem recebida de "${nome}" <${email}> | ID: ${resultado.lastInsertRowid}`);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Mensagem recebida com sucesso! Entraremos em contato em breve.',
        id: resultado.lastInsertRowid,
      });
    } catch (err) {
      console.error('[API] Erro ao salvar mensagem:', err);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno. Tente novamente mais tarde.',
      });
    }
  }
);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✨ Clínica Face & Arte - Servidor rodando`);
  console.log(`   → http://localhost:${PORT}\n`);
});

module.exports = app;
