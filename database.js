const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

async function inserirMensagem(dados) {

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Configuração do Supabase ausente (URL/KEY).");
  }

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

  if (error) {
    console.error('[Supabase Error]:', error.message);
    throw error;
  }

  return { lastInsertRowid: data && data.length > 0 ? data[0].id : null };
}

module.exports = { inserirMensagem };