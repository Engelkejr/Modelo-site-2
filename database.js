
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DB_PATH = path.join(dataDir, 'clinica.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('[DB] Erro ao abrir:', err.message);
  else console.log('[DB] Conectado ao SQLite.');
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS mensagens_contato (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nome        TEXT    NOT NULL,
      email       TEXT    NOT NULL,
      telefone    TEXT,
      servico     TEXT,
      mensagem    TEXT    NOT NULL,
      lida        INTEGER NOT NULL DEFAULT 0,
      criado_em   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `, (err) => {
    if (err) console.error('[DB] Erro ao criar tabela:', err.message);
  });
});

function inserirMensagem(dados) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO mensagens_contato (nome, email, telefone, servico, mensagem)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run([dados.nome, dados.email, dados.telefone, dados.servico, dados.mensagem], function(err) {
      if (err) reject(err);
      else resolve({ lastInsertRowid: this.lastID });
    });
    stmt.finalize();
  });
}

module.exports = { db, inserirMensagem };