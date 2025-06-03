// === FUNÇÕES GERAIS E VALIDAÇÕES NATIVAS ===

// Função para rolar a página para o topo
function topo() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Controlar a visibilidade do botão "Voltar ao Topo"
function controlarBotaoTopo() {
    const botaoTopo = document.getElementById('voltar-topo');
    if (!botaoTopo) return; // Garante que o botão existe

    if (window.pageYOffset > 300) {
        botaoTopo.style.display = "block";
        setTimeout(() => {
            botaoTopo.style.opacity = '1';
        }, 10);
    } else {
        // Oculta o botão com transição
        botaoTopo.style.opacity = '0';
        setTimeout(() => {
            if (window.pageYOffset <= 300) {
                botaoTopo.style.display = 'none';
            }
        }, 300);
    }
}

// Validar formato de e-mail (usada em cadastro e validação em tempo real)
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Função para mostrar alertas customizados (usando Bootstrap)
function showAlert(mensagem, tipo) {
    const alertAnterior = document.querySelector(".alerta-customizado");
    if (alertAnterior) {
        alertAnterior.remove();
    }

    const tiposAlerta = {
        success: "alert-success",
        error: "alert-danger",
        warning: "alert-warning",
        info: "alert-info"
    };

    const alerta = document.createElement("div");
    alerta.className = `alert ${tiposAlerta[tipo]} alert-dismissible fade show alerta-customizado`;
    alerta.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index:9999; min-width: 300px;';

    alerta.innerHTML = `
    ${mensagem}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`; // btn-close do Bootstrap 5

    document.body.appendChild(alerta);

    // Auto remover após 4 segundos
    setTimeout(() => {
        if (alerta.parentElement) {
            alerta.remove();
        }
    }, 4000);
}

// === LÓGICA DE LOGIN E CADASTRO ===

function login() {
    const usuario = document.getElementById("usuario-login").value;
    const senha = document.getElementById("senha-login").value;

    if (!usuario || !senha) {
        showAlert("Preencha todos os campos!", "warning");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    let logado = usuarios.find(u => u.usuario === usuario && u.senha === senha);

    if (logado) {
        sessionStorage.setItem("usuarioLogado", usuario);
        showAlert("Login realizado com sucesso!", "success");
        setTimeout(() => {
            window.location.href = "index.html"; // Use .href para clareza
        }, 1500);
    } else {
        showAlert("Usuário ou senha incorretos!", "error");
    }
}

function cadastro() {
    const usuarioNome = document.getElementById("usuario-cadastro").value.trim(); // .trim() para remover espaços em branco
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha-cadastro").value.trim();

    // Verificação de campos vazios
    if (!usuarioNome || !email || !senha) {
        showAlert("Preencha todos os campos!", "warning");
        return;
    }

    // Validação de Email
    if (!validarEmail(email)) {
        showAlert("Por favor, insira um e-mail válido!", "warning");
        // Adiciona feedback visual para o input de email se ele não foi validado pelo jQuery
        document.getElementById("email").classList.add("is-invalid");
        return;
    } else {
        // Garante que o feedback de erro seja removido se a validação passar
        document.getElementById("email").classList.remove("is-invalid");
        document.getElementById("email").classList.add("is-valid"); // Opcional, para feedback verde
    }

    // Validação de Senha
    if (senha.length < 6) {
        showAlert("A senha deve ter no mínimo 6 caracteres!", "warning");
        document.getElementById("senha-cadastro").classList.add("is-invalid");
        return;
    } else {
        document.getElementById("senha-cadastro").classList.remove("is-invalid");
        document.getElementById("senha-cadastro").classList.add("is-valid"); // Opcional
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

    // Verificar se usuário ou e-mail já existem
    if (usuarios.find(u => u.usuario === usuarioNome)) {
        showAlert("Nome de usuário já existe!", "warning");
        return;
    }
    if (usuarios.find(u => u.email === email)) {
        showAlert("E-mail já cadastrado!", "warning");
        return;
    }

    // Se tudo ok, cadastrar e redirecionar
    usuarios.push({ usuario: usuarioNome, email, senha });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    showAlert("Cadastro realizado com sucesso!", "success");

    // Limpar campos após cadastro bem-sucedido (opcional, antes do redirecionamento)
    document.getElementById("usuario-cadastro").value = "";
    document.getElementById("email").value = "";
    document.getElementById("senha-cadastro").value = "";

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
}


// === INICIALIZAÇÃO DE EVENTOS NATIVOS ===
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM carregado');

    // Configurar botão "Voltar ao Topo" (só no index, se o ID existir)
    const botaoTopo = document.getElementById('voltar-topo');
    if (botaoTopo) {
        botaoTopo.style.display = 'none';
        botaoTopo.style.transition = 'opacity 0.3s ease';
        window.addEventListener('scroll', controlarBotaoTopo);
    }

    // Configurar o SUBMIT do formulário de LOGIN
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário
            login(); // Chama sua função de login
        });
    }

    // Configurar o SUBMIT do formulário de CADASTRO
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário
            cadastro(); // Chama sua função de cadastro
        });
    }

    // Verificar se usuário está logado
    const usuarioLogado = sessionStorage.getItem("usuarioLogado");
    if (usuarioLogado) {
        console.log("Usuário logado:", usuarioLogado);

        // Mostrar nome do usuario na navbar
        const linkLogin = document.querySelector('a[href="login.html"]');
        if (linkLogin) {
            linkLogin.textContent = `Olá, ${usuarioLogado}`;
            linkLogin.href = '#'; // Altera para # ou link para perfil
            linkLogin.onclick = logout; // Atribui a função logout
        }
    }
});

// Função de logout
function logout() {
    sessionStorage.removeItem("usuarioLogado");
    showAlert("Logout realizado com sucesso!", "info"); // Usando showAlert
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}