// Função para exportar os dados atuais salvos no seu PontoFácil
function exportarDadosPonto() {
    const dados = {
        nome: localStorage.getItem("user_name") || "Não informado",
        entradaRegistrada: localStorage.getItem("ponto_entrada_unico") || "--:--",
        temaPrefencial: localStorage.getItem("theme") || "light",
        dataExportacao: new Date().toLocaleDateString('pt-BR')
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PontoFacil_Backup_${dados.dataExportacao.replace(/\//g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}
