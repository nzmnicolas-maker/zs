document.addEventListener("DOMContentLoaded", () => {
    // Seleção de Elementos DOM
    const inputEntrada = document.getElementById("ponto1");
    const cardBanco = document.getElementById("cardBanco");
    const txtSaidaPrincipal = document.getElementById("txtSaidaPrincipal");
    const floatingBar = document.getElementById("floatingBar");
    const previsaoHorario = document.getElementById("previsaoHorario");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const btnLimpar = document.getElementById("btnLimpar");
    
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
    // 3. REGRAS DE JORNADA + ALMOÇO FIXO DE 1H
    // ==========================================
    function obterRegrasJornada() {
        const diaDaSemana = new Date().getDay(); // 5 = Sexta-feira
        const minutosAlmocoFixo = 60; // 1 hora de almoço padrão
        
        // SEXTA-FEIRA: 8h de trabalho
        if (diaDaSemana === 5) {
            return {
                minutosTrabalhoExigidos: 480, 
                textoCard: "Banco (8h00)",
                cicloTotalComAlmoco: 480 + minutosAlmocoFixo // 540 minutos total
            };
        }
        
        // SEGUNDA A QUINTA: 8h30 de trabalho
        return {
            minutosTrabalhoExigidos: 510, 
            textoCard: "Banco (8h30)",
            cicloTotalComAlmoco: 510 + minutosAlmocoFixo // 570 minutos total
        };
    }

    const regrasDoDia = obterRegrasJornada();
    cardBanco.innerText = regrasDoDia.textoCard;

    // ==========================================
    // 4. REGISTRO INSTANTÂNEO DA ENTRADA
    // ==========================================
    btnInstant.addEventListener("click", () => {
        const agora = new Date();
        const horas = String(agora.getHours()).padStart(2, '0');
        const minutos = String(agora.getMinutes()).padStart(2, '0');
        inputEntrada.value = `${horas}:${minutos}`;
        salvarEProcessar();
    });

    // ==========================================
    // 5. MOTOR DE CÁLCULO E ATUALIZAÇÃO EM TEMPO REAL
    // ==========================================
    function timeToMinutes(timeStr) {
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    }

    function formatarHoraSimples(minutes) {
        if (minutes === null || isNaN(minutes)) return "--:--";
        const hours = Math.floor(minutes / 60) % 24;
        const mins = Math.floor(minutes % 60);
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    function carregarDados() {
        const valorSalvo = localStorage.getItem("ponto_entrada_unico");
        if (valorSalvo) inputEntrada.value = valorSalvo;
        processarSistema();
    }

    function salvarEProcessar() {
        localStorage.setItem("ponto_entrada_unico", inputEntrada.value);
        processarSistema();
    }

    function processarSistema() {
        const p1 = timeToMinutes(inputEntrada.value);
        const regras = obterRegrasJornada();

        if (p1) {
            // Calcula o horário exato de ir embora direto (Entrada + Jornada + 1h Almoço)
            const minutosSaidaFinal = p1 + regras.cicloTotalComAlmoco;
            const horaSaidaTexto = formatarHoraSimples(minutosSaidaFinal);

            // Atualiza os painéis de saída do topo e do rodapé
            txtSaidaPrincipal.innerText = horaSaidaTexto;
            previsaoHorario.innerText = horaSaidaTexto;
            floatingBar.classList.add("visible");
            progressBar.classList.add("pulsing");

            // Dispara a função que calcula o progresso dinâmico baseado no relógio agora
            atualizarProgressoTempoReal(p1, minutosSaidaFinal, regras.minutosTrabalhoExigidos);
        } else {
            txtSaidaPrincipal.innerText = "--:--";
            previsaoHorario.innerText = "--:--";
            floatingBar.classList.remove("visible");
            progressBar.classList.remove("pulsing");
            progressBar.style.width = "0%";
            progressText.innerText = "Aguardando entrada...";
        }
    }

    function atualizarProgressoTempoReal(minutosEntrada, minutosSaida, minutosTrabalhoMeta) {
        const agora = new Date();
        const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

        // Se ainda não chegou no horário de entrada
        if (minutosAgora < minutosEntrada) {
            progressBar.style.width = "0%";
            progressText.innerText = "Jornada ainda não iniciada";
            return;
        }

        // Se já passou do horário de ir embora
        if (minutosAgora >= minutosSaida) {
            progressBar.style.width = "100%";
            progressBar.classList.remove("pulsing");
            progressText.innerText = `Jornada concluída! Bom descanso!`;
            return;
        }

        // Calcula o tempo corrido total do dia até o momento
        let minutosCorridosTotal = minutosAgora - minutosEntrada;
        
        // Desconta de forma inteligente o almoço fictício (60 minutos) conforme o dia avança
        // Se já passou de 4 horas da entrada, assume-se que o almoço aconteceu/está acontecendo
        if (minutosCorridosTotal > 240) {
            minutosCorridosTotal = Math.max(240, minutosCorridosTotal - 60);
        }

        let porcentagem = (minutosCorridosTotal / minutosTrabalhoMeta) * 100;
        if (porcentagem > 100) porcentagem = 100;

        progressBar.style.width = `${porcentagem.toFixed(1)}%`;

        const hrs = Math.floor(minutosCorridosTotal / 60);
        const mns = minutosCorridosTotal % 60;
        progressText.innerText = `Trabalhado hoje: ${hrs}h${String(mns).padStart(2, '0')}m (${porcentagem.toFixed(0)}%)`;
    }

    // Ouvintes
    inputEntrada.addEventListener("input", salvarEProcessar);
    
    btnLimpar.addEventListener("click", () => {
        if (confirm("Deseja limpar o horário de entrada de hoje?")) {
            inputEntrada.value = "";
            localStorage.removeItem("ponto_entrada_unico");
            processarSistema();
        }
    });

    // Loop de Atualização Automática (Executa a cada 30 segundos para atualizar o progresso sozinho)
    setInterval(() => {
        if (inputEntrada.value) {
            processarSistema();
        }
    }, 30000);

    // Inicialização
    inicializarTema();
    inicializarPerfil();
    carregarDados();
});
