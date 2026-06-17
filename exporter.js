/**
 * PontoFácil Analytics - Exportador Estruturado para RH
 */
function exportarParaExcel(registros) {
  if (!registros || registros.length === 0) {
    alert("Nenhum dado disponível para exportação.");
    return;
  }

  // Cabeçalhos organizados para leitura corporativa
  const cabecalhos = ["Data", "Tipo de Registro", "Horário Oficial", "Chave de Autenticação"];
  
  const linhas = registros.map(reg => [
    reg.data,
    reg.tipo,
    reg.hora,
    reg.assinatura || "Sem assinatura"
  ]);

  // Caractere invisível \uFEFF força o Excel a abrir em UTF-8 nativo (corrige acentos)
  let csvContent = "\uFEFF"; 
  csvContent += cabecalhos.join(";") + "\n";
  
  linhas.forEach(linha => {
    csvContent += linha.join(";") + "\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const dataAtual = new Date().toISOString().split('T')[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `Espelho_Ponto_${dataAtual}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
