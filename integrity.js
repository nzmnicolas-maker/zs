(function verificarEFAzerLimpeza() {
    // Lista de chaves antigas do modelo de 4 batidas que não usamos mais
    const chavesAntigas = ["ponto_1", "ponto_2", "ponto_3", "ponto_4"];
    
    chavesAntigas.forEach(chave => {
        if (localStorage.getItem(chave)) {
            localStorage.removeItem(chave); // Remove o lixo do sistema antigo
            console.log(`[Integridade] Chave antiga removida: ${chave}`);
        }
    });

    // Garante que o banco de dados interno do PWA não está corrompido
    const entradaAtual = localStorage.getItem("ponto_entrada_unico");
    if (entradaAtual && !/^\d{2}:\d{2}$/.test(entradaAtual)) {
        console.error("[Integridade] Formato de hora inválido detectado. Resetando entrada.");
        localStorage.removeItem("ponto_entrada_unico");
    }
})();
