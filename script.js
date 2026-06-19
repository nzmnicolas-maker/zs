document.addEventListener("DOMContentLoaded", () => {
    // Seleção de Elementos DOM
    const inputs = [
        document.getElementById("ponto1"),
        document.getElementById("ponto2"),
        document.getElementById("ponto3"),
        document.getElementById("ponto4")
    ];
    const inputGroups = [
        document.getElementById("group_0"),
        document.getElementById("group_1"),
        document.getElementById("group_2"),
        document.getElementById("group_3")
    ];
    
    const cardBanco = document.getElementById("cardBanco");
    const txtSaidaPrincipal = document.getElementById("txtSaidaPrincipal");
    const floatingBar = document.getElementById("floatingBar");
    const previsaoHorario = document.getElementById("previsaoHorario");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const btnLimpar = document.getElementById("btnLimpar");
    
    // Elementos de Perfil e Botão Instantâneo
    const btnInstant = document.getElementById("btnInstant");
    const btnTheme = document.getElementById("btnTheme");
    const inputNome = document.getElementById("inputNome");
    const avatarBtn = document.getElementById("avatarBtn");
    const avatarInput = document.getElementById("avatarInput");
    const avatarImage = document.getElementById("avatarImage");
    const avatarPlaceholder = document.getElementById("avatarPlaceholder");

    // ==========================================
    // 1. GERENCIAMENTO DO TEMA (DARK MODE)
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
        localStorage.setItem("theme", estaNoEscuro ? "dark" : "light");
        btnTheme.innerText = estaNoEscuro ? "☀️" : "🌙";
    });

    // ==========================================
    // 2. PAINEL DE PERFIL (NOME E FOTO)
    // ==========================================
    function inicializarPerfil() {
        const nomeSalvo = localStorage.getItem("user_name");
        if (nomeSalvo) inputNome.value = nomeSalvo;

        const fotoSalva = localStorage.getItem("user_avatar");
        if (fotoSalva) {
            avatarImage.src = fotoSalva;
            avatarImage.style.display = "block";
            avatarPlaceholder.style.display = "none";
        }
    }

    inputNome.addEventListener("input", () => {
        localStorage.setItem("user_name", inputNome.value);
    });

    avatarBtn.addEventListener("click", () => avatarInput.click());

    avatarInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64String = event.target.result;
                localStorage.setItem("user_avatar", base64String);
                avatarImage.src = base64String;
                avatarImage.style.display = "block";
                avatarPlaceholder.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });

    // ==========================================
    // 3. REGRAS DE JORNADA DINÂMICA (SEGUNDA A SEXTA)
    // ==========================================
    function obterRegrasJornada() {
        const diaDaSemana = new Date().getDay(); // 1 = Segunda, 5 = Sexta, 6 = Sábado, 0 = Domingo
        
        // SEXTA-FEIRA: Jornada de 08h00
        if (diaDaSemana === 5) {
            return {
                minutosTrabalhoExigidos: 480, 
                textoCard: "Banco (8h00)",
                cicloTotalComAlmoco: 540     
            };
        }
        
        // SEGUNDA A QUINTA (Fallback padrão para finais de semana também)
        return {
            minutosTrabalhoExigidos: 510, 
            textoCard: "Banco (8h30)",
            cicloTotalComAlmoco: 570     
        };
    }

    const regrasDoDia = obterRegrasJornada();
    cardBanco.innerText = regrasDoDia.textoCard;

    // ==========================================
    // 4. REGISTRO INSTANTÂNEO COM UM CLIQUE
    // ==========================================
    btnInstant.addEventListener("click", () => {
        const agora = new Date();
        const horas = String(agora.getHours()).padStart(2, '0');
        const minutos = String(agora.getMinutes()).padStart(2, '0');
        const horarioAtualString = `${horas}:${minutos}`;

        let campoPreenchido = false;
        for (let i = 0; i < inputs.length; i++) {
            if (!inputs[i].value) {
                inputs[i].value = horarioAtualString;
                campoPreenchido = true;
                salvarDadosPonto();
                break;
            }
        }

        if (!campoPreenchido) {
            alert("Todos os 4 pontos de hoje já estão registrados!");
        }
    });

    function atualizarFocoVisualCampos() {
        inputGroups.forEach(group => group.classList.remove("active-focus"));
        for (let i = 0; i < inputs.length; i++) {
            if (!inputs[i].value) {
                inputGroups[i].classList.add("active-focus");
                break;
            }
        }
    }

    // ==========================================
    // 5. MOTOR DE CÁLCULO E OS 3 CENÁRIOS
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
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0 flights')}`;
    }

    // Função de tratamento interno simples de string limpa para exibição direta
    function formatarHoraSimples(minutes) {
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

        // CENÁRIO 1: Só a Entrada Manhã batida
        if (p1 && !p2 && !p3 && !p4) {
            floatingBar.classList.add("visible");
            previsaoMinutos = p1 + regras.cicloTotalComAlmoco;
            
            const saidaFormatada = formatarHoraSimples(previsaoMinutos);
            previsaoHorario.innerText = saidaFormatada;
            txtSaidaPrincipal.innerText = saidaFormatada; // Alimenta o novo card destacado
            
            minutosTrabalhadosAteAgora = 0;
            progressBar.classList.add("pulsing");
        }

        // CENÁRIO 2: Saiu para Almoçar
        else if (p1 && p2 && !p3 && !p4) {
            floatingBar.classList.add("visible");
            previsaoMinutos = p1 + regras.cicloTotalComAlmoco;
            
            const saidaFormatada = formatarHoraSimples(previsaoMinutos);
            previsaoHorario.innerText = saidaFormatada + " (Em Almoço)";
            txtSaidaPrincipal.innerText = saidaFormatada;
            
            minutosTrabalhadosAteAgora = p2 - p1;
            progressBar.classList.remove("pulsing");
        }

        // CENÁRIO 3: Voltou do Almoço (Cálculo Fino Cirúrgico)
        else if (p1 && p2 && p3 && !p4) {
            floatingBar.classList.add("visible");
            const tempoTrabalhadoManha = p2 - p1;
            const tempoRestanteNecessario = regras.minutosTrabalhoExigidos - tempoTrabalhadoManha;
            
            previsaoMinutos = p3 + tempoRestanteNecessario;
            
            const saidaFormatada = formatarHoraSimples(previsaoMinutos);
            previsaoHorario.innerText = saidaFormatada;
            txtSaidaPrincipal.innerText = saidaFormatada; // Cravado com precisão do almoço real
            
            minutosTrabalhadosAteAgora = tempoTrabalhadoManha;
            progressBar.classList.add("pulsing");
        }

        // FIM DO DIA: Tudo preenchido
        else if (p1 && p2 && p3 && p4) {
            floatingBar.classList.add("visible");
            const tempoTrabalhadoManha = p2 - p1;
            const tempoTrabalhadoTarde = p4 - p3;
            minutosTrabalhadosAteAgora = tempoTrabalhadoManha + tempoTrabalhadoTarde;
            progressBar.classList.remove("pulsing");
            
            const saldo = minutosTrabalhadosAteAgora - regras.minutosTrabalhoExigidos;
            txtSaidaPrincipal.innerText = "Concluído";
            
            if (saldo >= 0) {
                previsaoHorario.innerHTML = `Concluído! Saldo: <span>+${formatarHoraSimples(saldo)}</span>`;
            } else {
                previsaoHorario.innerHTML = `Concluído! Faltou: <span style="color:#ef4444">-${formatarHoraSimples(Math.abs(saldo))}</span>`;
            }
        } else {
            floatingBar.classList.remove("visible");
            progressBar.classList.remove("pulsing");
            txtSaidaPrincipal.innerText = "--:--";
        }

        atualizarProgresso(minutosTrabalhadosAteAgora, regras.minutosTrabalhoExigidos);
        atualizarFocoVisualCampos();
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

    // Ouvintes de Eventos
    inputs.forEach(input => input.addEventListener("input", salvarDadosPonto));

    btnLimpar.addEventListener("click", () => {
        if (confirm("Deseja limpar os horários registrados de hoje?")) {
            inputs.forEach((input, index) => {
                input.value = "";
                localStorage.removeItem(`ponto_${index + 1}`);
            });
            processarCenarios();
        }
    });

    // Inicialização do Fluxo
    inicializarTema();
    inicializarPerfil();
    carregarDadosPonto();
});
