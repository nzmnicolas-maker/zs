function exportarDadosSaaS() {
    const dados = {
        nomeUsuario: localStorage.getItem("user_name") || "Usuário PontoFácil",
        entradaRegistrada: localStorage.getItem("ponto_entrada_unico") || "Não registrada",
        temaDefinido: localStorage.getItem("theme") || "light",
        fotoPerfilSalva: localStorage.getItem("user_avatar") ? "Sim (Base64)" : "Não",
        dataExportacao: new Date().toLocaleDateString('pt-BR')
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PontoFacil_SaaS_Backup_${dados.dataExportacao.replace(/\//g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
