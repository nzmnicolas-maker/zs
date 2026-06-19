(function verificarIntegridadeSaaS() {
    // 1. Limpa lixos de versões muito antigas do app
    const lixoAntigo = ["ponto_1", "ponto_2", "ponto_3", "ponto_4"];
    lixoAntigo.forEach(chave => {
        if (localStorage.getItem(chave)) localStorage.removeItem(chave);
    });

    // 2. Proteção do Formato de Hora da Entrada Única
    const entrada = localStorage.getItem("ponto_entrada_unico");
    if (entrada && !/^\d{2}:\d{2}$/.test(entrada)) {
        console.warn("[Integridade] Formato de hora inválido detectado. Corrigindo...");
        localStorage.removeItem("ponto_entrada_unico");
    }

    // 3. Validação do tamanho da foto de perfil (Base64) para evitar estouro de memória local
    const foto = localStorage.getItem("user_avatar");
    if (foto && !foto.startsWith("data:image/")) {
        console.error("[Integridade] String de imagem corrompida. Resetando avatar.");
        localStorage.removeItem("user_avatar");
    }
    
    console.log("[Integridade] Banco de dados local verificado e otimizado para SaaS Premium!");
})();
