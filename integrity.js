/**
 * PontoFácil Security Core - Proteção Criptográfica SHA-256
 */
const SECURITY_SECRET = "PONTO_FACIL_ULTRA_SECRET_KEY_2026";

// Gera o código de autenticação único de cada ponto
async function gerarAssinaturaDigital(ponto) {
  const mensagem = `${ponto.tipo}-${ponto.timestamp}-${ponto.data}-${SECURITY_SECRET}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(mensagem);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Varre o histórico local garantindo que nenhum ponto foi alterado manualmente
async function verificarIntegridadeDosDados(listaRegistros) {
  if (!listaRegistros || listaRegistros.length === 0) return true;
  
  for (let registro of listaRegistros) {
    if (!registro.assinatura) return false; // Sem assinatura = alterado ou antigo
    
    // Recria o objeto temporário para testar o hash original
    const dadosOriginais = { tipo: registro.tipo, timestamp: registro.timestamp, data: registro.data };
    const hashValido = await gerarAssinaturaDigital(dadosOriginais);
    
    if (hashValido !== registro.assinatura) {
      console.error("⚠️ Violação detectada no registro:", registro);
      return false; 
    }
  }
  return true;
}
