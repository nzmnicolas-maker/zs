document.addEventListener("DOMContentLoaded", () => {
    // Seleção de Elementos Globais
    const inputs = [
        document.getElementById("ponto1"),
        document.getElementById("ponto2"),
        document.getElementById("ponto3"),
        document.getElementById("ponto4")
    ];
    const cardBanco = document.getElementById("cardBanco");
    const floatingBar = document.getElementById("floatingBar");
    const previsaoHorario = document.getElementById("previsaoHorario");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const btnLimpar = document.getElementById("btnLimpar");

    // Elementos Novos (Perfil e Tema)
    const btnTheme = document.getElementById("btnTheme");
    const inputNome = document.getElementById("inputNome");
    const avatarBtn = document.getElementById("avatarBtn");
    const avatarInput = document.getElementById("avatarInput");
    const avatarImage = document.getElementById("avatarImage");
    const avatarPlaceholder = document.getElementById("avatarPlaceholder");

    // ==========================================
    // 1. GERENCIAMENTO DE TEMA (DARK MODE)
    // ==========================================
    function inicializarTema() {
        const temaSalvo = localStorage.getItem("theme") || "light";
        if (temaSalvo === "dark") {
            document.body.classList.add("dark-mode");
            btnTheme.innerText = "☀️";
        } else {
            document.body.classList.remove("dark-mode");
            btnTheme.innerText = "🌙";
        }
    }

    btnTheme.addEventListener("click", () => {
        const estaNoEscuro = document.body.classList.toggle("dark-mode");
        if (estaNoEscuro) {
            localStorage.setItem("theme", "dark");
            btnTheme.innerText = "☀️";
        } else {
            localStorage.setItem("theme", "light");
            btnTheme.innerText = "🌙";
        }
    });

    // ==========================================
    // 2. CADASTRO DE PERFIL (NOME E FOTO)
    // ==========================================
    function inicializarPerfil() {
        // Carrega o Nome
        const nomeSalvo = localStorage.getItem("user_name");
        if (nomeSalvo) inputNome.value = nomeSalvo;

        // Carrega a Foto
        const fotoSalva = localStorage.getItem("user_avatar");
        if (fotoSalva) {
            avatarImage.src = fotoSalva;
            avatarImage.style.display = "block";
            avatarPlaceholder.style.display = "none";
        }
    }

    // Escuta alteração do Nome
    inputNome.addEventListener("input", () => {
        localStorage.setItem("user_name", inputNome.value);
    });

    // Gatilho de clique no botão redondo de foto
    avatarBtn.addEventListener("click", () => avatarInput.click());

    // Processamento do upload da foto (Conversão para Base64)
    avatarInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64String = event.target.result;
                // Salva no LocalStorage
                localStorage.setItem("user_avatar", base64String);
                // Renderiza na tela
                avatarImage.src = base64String;
                avatarImage.style.display = "block";
                avatarPlaceholder.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });


    // ==========================================
    // 3. REGRAS DA JORNADA (MUDANÇA DE SEXTA)
    // ==========================================
    function obterRegrasJornada() {
        const diaDaSemana = new Date().getDay(); // 1 = Seg, 5 = Sex...
        
        // Regra de SEXTA-FEIRA: 8h de trabalho
        if (diaDaSemana === 5) {
            return {
                minutosTrabalhoExigidos: 480, // 8h
                textoCard: "Banco (8h00)",
                cicloTotalComAlmoco: 540     // 8h + 1h almoço
            };
        }
        
        // Regra de SEGUNDA A QUINTA: 8h30 de trabalho
        return {
            minutosTrabalhoExigidos: 510, // 8h30
            textoCard: "Banco (8h30)",
            cicloTotalComAlmoco: 570     // 8h30 + 1h almoço
        };
    }

    // Seta o card inicial do banco imediatamente
    const regrasDoDia = obterRegrasJornada();
    cardBanco.innerText = regrasDoDia.textoCard;


    // ==========================================
    // 4. CÁLCULO DE HORÁRIOS E CENÁRIOS
    // ==========================================
    function timeToMinutes(timeStr) {
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    }

    function minutesToTime(minutes) {
        if (minutes === null || isNaN(minutes)) return "--:--";
        const hours = Math.floor(minutes / 60) % 24;
        const mins = Math.floor(minutes % 60);
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    function carregarDadosPonto() {
        inputs.forEach((input, index) => {
            const valorSalvo = localStorage.getItem(`ponto_${index + 1}`);
            if (valorSalvo) input.value = valorSalvo;
        });
        processarCenarios();
    }

    function salvarDadosPonto() {
        inputs.forEach((input, index) => {
            localStorage.setItem(`ponto_${index + 1}`, input.value);
        });
        processarCenarios();
    }

    function processarCenarios() {
        const p1 = timeToMinutes(inputs[0].value);
        const p2 = timeToMinutes(inputs[1].value);
        const p3 = timeToMinutes(inputs[2].value);
        const p4 = timeToMinutes(inputs[3].value);

        const regras = obterRegrasJornada();
        let previsaoMinutos = null;
        let minutosTrabalhadosAteAgora = 0;

        // CENÁRIO 1: Apenas Entrada Batida
        if (p1 && !p2 && !p3 && !p4) {
            floatingBar.style.display = "block";
            previsaoMinutos = p1 + regras.cicloTotalComAlmoco;
            previsaoHorario.innerText = minutesToTime(previsaoMinutos);
            minutosTrabalhadosAteAgora = 0;
        }

        // CENÁRIO 2: Saída para Almoço
        else if (p1 && p2 && !p3 && !p4) {
            floatingBar.style.display = "block";
            previsaoMinutos = p1 + regras.cicloTotalComAlmoco;
            previsaoHorario.innerText = minutesToTime(previsaoMinutos) + " (Em Almoço)";
            minutosTrabalhadosAteAgora = p2 - p1;
        }

        // CENÁRIO 3: Retorno do Almoço (Ajuste cirúrgico fino)
        else if (p1 && p2 && p3 && !p4) {
            floatingBar.style.display = "block";
            const tempoTrabalhadoManha = p2 - p1;
            const tempoRestanteNecessario = regras.minutosTrabalhoExigidos - tempoTrabalhadoManha;
            
            previsaoMinutos = p3 + tempoRestanteNecessario;
            previsaoHorario.innerText = minutesToTime(previsaoMinutos);
            minutosTrabalhadosAteAgora = tempoTrabalhadoManha;
        }

        // FIM DO DIA: Todos batidos
        else if (p1 && p2 && p3 && p4) {
            floatingBar.style.display = "block";
            const tempoTrabalhadoManha = p2 - p1;
            const tempoTrabalhadoTarde = p4 - p3;
            minutosTrabalhadosAteAgora = tempoTrabalhadoManha + tempoTrabalhadoTarde;
            
            const saldo = minutosTrabalhadosAteAgora - regras.minutosTrabalhoExigidos;
            if (saldo >= 0) {
                previsaoHorario.innerText = `Concluído! Saldo: +${minutesToTime(saldo)}`;
            } else {
                previsaoHorario.innerText = `Concluído! Faltou: -${minutesToTime(Math.abs(saldo))}`;
            }
        } else {
            floatingBar.style.display = "none";
        }

        atualizarProgresso(minutosTrabalhadosAteAgora, regras.minutosTrabalhoExigidos);
    }

    function atualizarProgresso(atuais, meta) {
        if (meta === 0 || atuais === 0) {
            progressBar.style.width = "0%";
            progressText.innerText = "Progresso: 0%";
            return;
        }

        let porcentagem = (atuais / meta) * 100;
        if (porcentagem > 100) porcentagem = 100;
        
        progressBar.style.width = `${porcentagem.toFixed(1)}%`;
        
        const horasFormatadas = Math.floor(atuais / 60);
        const minutosFormatados = atuais % 60;
        progressText.innerText = `Trabalhado: ${horasFormatadas}h${String(minutosFormatados).padStart(2, '0')}m (${porcentagem.toFixed(0)}%)`;
    }

    // Ouvintes de alteração dos pontos
    inputs.forEach(input => input.addEventListener("input", salvarDadosPonto));

    // Botão Limpar Tudo
    btnLimpar.addEventListener("click", () => {
        if (confirm("Deseja limpar seus horários? (Nome e Foto não serão apagados)")) {
            inputs.forEach((input, index) => {
                input.value = "";
                localStorage.removeItem(`ponto_${index + 1}`);
            });
            processarCenarios();
        }
    });

    // Inicialização do fluxo da aplicação
    inicializarTema();
    inicializarPerfil();
    carregarDadosPonto();
});
// Inicialização do Sistema e Seleção de Elementos DOM
document.addEventListener("DOMContentLoaded", () => {
    const inputs = [
        document.getElementById("ponto1"),
        document.getElementById("ponto2"),
        document.getElementById("ponto3"),
        document.getElementById("ponto4")
    ];
    const cardBanco = document.getElementById("cardBanco");
    const floatingBar = document.getElementById("floatingBar");
    const previsaoHorario = document.getElementById("previsaoHorario");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const btnLimpar = document.getElementById("btnLimpar");

    // 1. Função Central de Regras por Dia da Semana
    function obterRegrasJornada() {
        const diaDaSemana = new Date().getDay(); // 0 = Domingo, 1 = Segunda, ..., 5 = Sexta, 6 = Sábado
        
        // Se for SEXTA-FEIRA (Dia 5)
        if (diaDaSemana === 5) {
            return {
                minutosTrabalhoExigidos: 480, // 8h00 em minutos
                textoCard: "Banco (8h00)",
                cicloTotalComAlmoco: 540     // 8h + 1h almoço padrão = 9h00 totais
            };
        }
        
        // SEGUNDA A QUINTA (ou fallback para finais de semana)
        return {
            minutosTrabalhoExigidos: 510, // 8h30 em minutos
            textoCard: "Banco (8h30)",
            cicloTotalComAlmoco: 570     // 8h30 + 1h almoço padrão = 9h30 totais
        };
    }

    // Configura o cabeçalho do card imediatamente baseado nas regras do dia
    const regrasDoDia = obterRegrasJornada();
    cardBanco.innerText = regrasDoDia.textoCard;

    // Converte String de Horário "HH:MM" para minutos absolutos desde o início do dia
    function timeToMinutes(timeStr) {
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    }

    // Converte minutos absolutos de volta para String no formato "HH:MM"
    function minutesToTime(minutes) {
        if (minutes === null || isNaN(minutes)) return "--:--";
        const hours = Math.floor(minutes / 60) % 24;
        const mins = Math.floor(minutes % 60);
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    // Carrega dados salvos do LocalStorage
    function carregarDados() {
        inputs.forEach((input, index) => {
            const valorSalvo = localStorage.getItem(`ponto_${index + 1}`);
            if (valorSalvo) input.value = valorSalvo;
        });
        processarCenarios();
    }

    // Salva modificações no LocalStorage em tempo real
    function salvarDados() {
        inputs.forEach((input, index) => {
            localStorage.setItem(`ponto_${index + 1}`, input.value);
        });
        processarCenarios();
    }

    // 2. Motor de Processamento dos 3 Cenários Inteligentes
    function processarCenarios() {
        const p1 = timeToMinutes(inputs[0].value);
        const p2 = timeToMinutes(inputs[1].value);
        const p3 = timeToMinutes(inputs[2].value);
        const p4 = timeToMinutes(inputs[3].value);

        const regras = obterRegrasJornada();
        let previsaoMinutos = null;
        let minutosTrabalhadosAteAgora = 0;

        // CENÁRIO 1: Apenas o 1º Ponto foi batido (Entrada da manhã)
        if (p1 && !p2 && !p3 && !p4) {
            floatingBar.style.display = "block";
            previsaoMinutos = p1 + regras.cicloTotalComAlmoco; // Soma a jornada necessária + 1h estimada de almoço
            previsaoHorario.innerText = minutesToTime(previsaoMinutos);
            
            // Progresso baseado no tempo estimado corrido simulado ou fixado inicial
            minutosTrabalhadosAteAgora = 0;
        }

        // CENÁRIO 2: Saiu para o Almoço (1º e 2º Pontos batidos)
        else if (p1 && p2 && !p3 && !p4) {
            floatingBar.style.display = "block";
            // Segura a previsão calculada no cenário 1 (Ponto 1 + Ciclo padrão) para manter a referência estável
            previsaoMinutos = p1 + regras.cicloTotalComAlmoco;
            previsaoHorario.innerText = minutesToTime(previsaoMinutos) + " (Em Almoço)";
            
            minutosTrabalhadosAteAgora = p2 - p1;
        }

        // CENÁRIO 3: Voltou do Almoço (1º, 2º e 3º Pontos batidos) - AJUSTE CIRÚRGICO
        else if (p1 && p2 && p3 && !p4) {
            floatingBar.style.display = "block";
            
            const tempoTrabalhadoManha = p2 - p1;
            const tempoAlmocoReal = p3 - p2;
            const tempoRestanteNecessario = regras.minutosTrabalhoExigidos - tempoTrabalhadoManha;
            
            // A saída exata é o retorno do almoço (P3) somado ao tempo que ainda resta trabalhar
            previsaoMinutos = p3 + tempoRestanteNecessario;
            previsaoHorario.innerText = minutesToTime(previsaoMinutos);
            
            minutosTrabalhadosAteAgora = tempoTrabalhadoManha;
        }

        // Todos os pontos batidos (Dia concluído)
        else if (p1 && p2 && p3 && p4) {
            floatingBar.style.display = "block";
            const tempoTrabalhadoManha = p2 - p1;
            const tempoTrabalhadoTarde = p4 - p3;
            minutosTrabalhadosAteAgora = tempoTrabalhadoManha + tempoTrabalhadoTarde;
            
            const saldo = minutosTrabalhadosAteAgora - regras.minutosTrabalhoExigidos;
            if (saldo >= 0) {
                previsaoHorario.innerText = `Concluído! Saldo: +${minutesToTime(saldo)}`;
            } else {
                previsaoHorario.innerText = `Concluído! Faltou: -${minutesToTime(Math.abs(saldo))}`;
            }
        }

        // Se nenhum ponto foi inserido, oculta a barra flutuante
        else {
            floatingBar.style.display = "none";
        }

        // Atualização da Barra de Progresso de forma dinâmica
        atualizarProgresso(minutosTrabalhadosAteAgora, regras.minutosTrabalhoExigidos);
    }

    // Atualiza os elementos gráficos da barra de carregamento
    function atualizarProgresso(atuais, meta) {
        if (meta === 0 || atuais === 0) {
            progressBar.style.width = "0%";
            progressText.innerText = "Progresso: 0%";
            return;
        }

        let porcentagem = (atuais / meta) * 100;
        if (porcentagem > 100) porcentagem = 100;
        
        progressBar.style.width = `${porcentagem.toFixed(1)}%`;
        
        const horasFormatadas = Math.floor(atuais / 60);
        const minutosFormatados = atuais % 60;
        progressText.innerText = `Trabalhado: ${horasFormatadas}h${String(minutosFormatados).padStart(2, '0')}m (${porcentagem.toFixed(0)}%)`;
    }

    // Ouvintes de Evento (Listeners) nos inputs para salvar alterações instantaneamente
    inputs.forEach(input => {
        input.addEventListener("input", salvarDados);
    });

    // Ação do Botão Limpar Registros
    btnLimpar.addEventListener("click", () => {
        if (confirm("Deseja realmente limpar todos os horários registrados?")) {
            inputs.forEach((input, index) => {
                input.value = "";
                localStorage.removeItem(`ponto_${index + 1}`);
            });
            processarCenarios();
        }
    });

    // Executa a carga inicial dos dados
    carregarDados();
});
