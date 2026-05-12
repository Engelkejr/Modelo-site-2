const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inserirMensagem(dados) {
  const { data, error } = await supabase
    .from('mensagens_contato')
    .insert([
      { 
        nome: dados.nome, 
        email: dados.email, 
        telefone: dados.telefone, 
        servico: dados.servico, 
        mensagem: dados.mensagem 
      }
    ])
    .select();

  if (error) throw error;
  return { lastInsertRowid: data[0].id };
}

module.exports = { inserirMensagem };