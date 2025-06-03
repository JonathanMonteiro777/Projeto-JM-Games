// ===== CONFIGURAÇÕES =====
const LOGIN_CONFIG = {
  MIN_PASSWORD_LENGTH: 6,
  TOAST_DURATION: 5000
};

// ===== UTILITÁRIOS =====
function mostrarToast(mensagem, tipo = 'info') {
  const toastElement = document.getElementById('toastNotificacao');
  const toastMensagem = document.getElementById('toastMensagem');
  
  // Configurar ícone e cor baseado no tipo
  const toastHeader = toastElement.querySelector('.toast-header i');
  toastHeader.className = {
    success: 'bi bi-check-circle text-success me-2',
    warning: 'bi bi-exclamation-triangle text-warning me-2',
    error: 'bi bi-x-circle text-danger me-2',
    info: 'bi bi-info-circle text-primary me-2'
  }[tipo] || 'bi bi-info-circle text-primary me-2';
  
  toastMensagem.textContent = mensagem;
  
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: LOGIN_CONFIG.TOAST_DURATION
  });
  
  toast.show();
}

function toggleLoading(buttonId, textId, loadingId, isLoading) {
  const button = document.getElementById(buttonId);
  const text = document.getElementById(textId);
  const loading = document.getElementById(loadingId);
  
  if (isLoading) {
    button.disabled = true;
    loading.classList.remove('d-none');
  } else {
    button.disabled = false;
    loading.classList.add('d-none');
  }
}

// ===== VALIDAÇÃO DE FORMULÁRIOS =====
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarSenha(senha) {
  return senha.length >= LOGIN_CONFIG.MIN_PASSWORD_LENGTH;
}

function validarFormulario(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input[required]');
  
  inputs.forEach(input => {
    const value = input.value.trim();
    let inputValid = true;
    
    // Validação específica por tipo
    if (input.type === 'email') {
      inputValid = validarEmail(value);
    } else if (input.type === 'password') {
      inputValid = validarSenha(value);
    } else if (input.type === 'checkbox') {
      inputValid = input.checked;
    } else {
      inputValid = value.length > 0;
    }
    
    // Validação especial para confirmação de senha
    if (input.id === 'confirmarSenha') {
      const senhaOriginal = document.getElementById('senhaCadastro').value;
      inputValid = value === senhaOriginal && value.length > 0;
    }
    
    // Aplicar classes de validação
    if (inputValid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
      isValid = false;
    }
  });
  
  return isValid;
}

// ===== TOGGLE DE SENHA =====
function inicializarToggleSenha() {
  // Toggle para login
  const toggleSenha = document.getElementById('toggleSenha');
  const senhaInput = document.getElementById('senha');
  const iconeSenha = document.getElementById('iconeSenha');
  
  if (toggleSenha) {
    toggleSenha.addEventListener('click', () => {
      const tipo = senhaInput.type === 'password' ? 'text' : 'password';
      senhaInput.type = tipo;
      
      iconeSenha.classList.toggle('bi-eye');
      iconeSenha.classList.toggle('bi-eye-slash');
    });
  }
  
  // Toggle para cadastro
  const toggleSenhaCadastro = document.getElementById('toggleSenhaCadastro');
  const senhaCadastroInput = document.getElementById('senhaCadastro');
  const iconeSenhaCadastro = document.getElementById('iconeSenhaCadastro');
  
  if (toggleSenhaCadastro) {
    toggleSenhaCadastro.addEventListener('click', () => {
      const tipo = senhaCadastroInput.type === 'password' ? 'text' : 'password';
      senhaCadastroInput.type = tipo;
      
      iconeSenhaCadastro.classList.toggle('bi-eye');
      iconeSenhaCadastro.classList.toggle('bi-eye-slash');
    });
  }
}

// ===== FORMULÁRIO DE LOGIN =====
function inicializarFormularioLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validarFormulario(form)) {
      mostrarToast('Por favor, corrija os campos destacados', 'warning');
      return;
    }
    
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const lembrarMe = document.getElementById('lembrarMe').checked;
    
    toggleLoading('btnLogin', 'textoLogin', 'loadingLogin', true);
    
    try {
      // Simular chamada de API
      await simularLogin(email, senha, lembrarMe);
      
      mostrarToast('Login realizado com sucesso!', 'success');
      
      // Redirecionar após sucesso
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      
    } catch (error) {
      mostrarToast(error.message, 'error');
    } finally {
      toggleLoading('btnLogin', 'textoLogin', 'loadingLogin', false);
    }
  });
}

// ===== FORMULÁRIO DE CADASTRO =====
function inicializarFormularioCadastro() {
  const form = document.getElementById('formCadastro');
  if (!form) return;
  
  // Validação em tempo real para confirmação de senha
  const senhaCadastro = document.getElementById('senhaCadastro');
  const confirmarSenha = document.getElementById('confirmarSenha');
  
  if (confirmarSenha) {
    confirmarSenha.addEventListener('input', function() {
      const senhaOriginal = senhaCadastro.value;
      const senhaConfirmacao = this.value;
      
      if (senhaConfirmacao.length > 0) {
        if (senhaOriginal === senhaConfirmacao) {
          this.classList.remove('is-invalid');
          this.classList.add('is-valid');
        } else {
          this.classList.remove('is-valid');
          this.classList.add('is-invalid');
        }
      }
    });
  }
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validarFormulario(form)) {
      mostrarToast('Por favor, corrija os campos destacados', 'warning');
      return;
    }
    
    const dadosCadastro = {
      nome: document.getElementById('nomeCompleto').value.trim(),
      email: document.getElementById('emailCadastro').value.trim(),
      senha: document.getElementById('senhaCadastro').value,
      telefone: document.getElementById('telefone').value.trim(),
      receberOfertas: document.getElementById('receberOfertas').checked
    };
    
    toggleLoading('btnCadastrar', 'textoCadastrar', 'loadingCadastrar', true);
    
    try {
      await simularCadastro(dadosCadastro);
      
      mostrarToast('Conta criada com sucesso!', 'success');
      
      // Fechar modal e mostrar login
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalCadastro'));
      modal.hide();
      
      // Preencher email no formulário de login
      document.getElementById('email').value = dadosCadastro.email;
      
    } catch (error) {
      mostrarToast(error.message, 'error');
    } finally {
      toggleLoading('btnCadastrar', 'textoCadastrar', 'loadingCadastrar', false);
    }
  });
}

// ===== FORMULÁRIO DE RECUPERAÇÃO DE SENHA =====
function inicializarFormularioRecuperacao() {
  const form = document.getElementById('formEsqueciSenha');
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailRecuperacao').value.trim();
    
    if (!validarEmail(email)) {
      document.getElementById('emailRecuperacao').classList.add('is-invalid');
      mostrarToast('Por favor, insira um e-mail válido', 'warning');
      return;
    }
    
    document.getElementById('emailRecuperacao').classList.remove('is-invalid');
    document.getElementById('emailRecuperacao').classList.add('is-valid');
    
    toggleLoading('btnRecuperar', 'textoRecuperar', 'loadingRecuperar', true);
    
    try {
      await simularRecuperacaoSenha(email);
      
      mostrarToast('Link de recuperação enviado para seu e-mail!', 'success');
      
      // Fechar modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalEsqueciSenha'));
      modal.hide();
      
    } catch (error) {
      mostrarToast(error.message, 'error');
    } finally {
      toggleLoading('btnRecuperar', 'textoRecuperar', 'loadingRecuperar', false);
    }
  });
}

// ===== SIMULAÇÕES DE API =====
async function simularLogin(email, senha, lembrarMe) {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simular validação (em produção, isso seria feito no backend)
  const usuariosValidos = [
    { email: 'admin@jmgames.com', senha: '123456' },
    { email: 'teste@teste.com', senha: 'teste123' }
  ];
  
  const usuario = usuariosValidos.find(u => u.email === email && u.senha === senha);
  
  if (!usuario) {
    throw new Error('E-mail ou senha incorretos');
  }
  
  // Salvar dados do usuário
  const dadosUsuario = {
    email: usuario.email,
    nome: 'Usuário Teste',
    loggedIn: true,
    loginTime: new Date().toISOString()
  };
  
  if (lembrarMe) {
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
  } else {
    sessionStorage.setItem('usuario', JSON.stringify(dadosUsuario));
  }
  
  return dadosUsuario;
}

async function simularCadastro(dados) {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // Simular verificação de e-mail existente
  const emailsExistentes = ['admin@jmgames.com', 'teste@jmgames.com'];
  
  if (emailsExistentes.includes(dados.email)) {
    throw new Error('Este e-mail já está cadastrado');
  }
  
  // Simular criação de conta
  console.log('Dados do cadastro:', dados);
  
  return { success: true, message: 'Conta criada com sucesso' };
}

async function simularRecuperacaoSenha(email) {
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simular verificação se e-mail existe
  const emailsValidos = ['admin@jmgames.com', 'teste@teste.com'];
  
  if (!emailsValidos.includes(email)) {
    throw new Error('E-mail não encontrado em nossa base de dados');
  }
  
  console.log('Link de recuperação enviado para:', email);
  
  return { success: true, message: 'Link enviado' };
}

// ===== LOGIN SOCIAL =====
function loginGoogle() {
  mostrarToast('Redirecionando para Google...', 'info');
  
  // Simular processo de login social
  setTimeout(() => {
    mostrarToast('Funcionalidade em desenvolvimento', 'warning');
  }, 2000);
}

function loginFacebook() {
  mostrarToast('Redirecionando para Facebook...', 'info');
  
  // Simular processo de login social
  setTimeout(() => {
    mostrarToast('Funcionalidade em desenvolvimento', 'warning');
  }, 2000);
}

// ===== MÁSCARA PARA TELEFONE =====
function aplicarMascaraTelefone() {
  const telefoneInput = document.getElementById('telefone');
  if (!telefoneInput) return;
  
  telefoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
    }
    
    e.target.value = value;
  });
}

// ===== VALIDAÇÃO EM TEMPO REAL =====
function inicializarValidacaoTempoReal() {
  const inputs = document.querySelectorAll('input[required]');
  
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      const form = this.closest('form');
      if (form) {
        validarCampoIndividual(this);
      }
    });
    
    input.addEventListener('input', function() {
      // Remover classe de erro quando usuário começar a digitar
      if (this.classList.contains('is-invalid')) {
        this.classList.remove('is-invalid');
      }
    });
  });
}

function validarCampoIndividual(input) {
  const value = input.value.trim();
  let isValid = true;
  
  if (input.type === 'email') {
    isValid = validarEmail(value);
  } else if (input.type === 'password') {
    isValid = validarSenha(value);
  } else if (input.type === 'checkbox') {
    isValid = input.checked;
  } else {
    isValid = value.length > 0;
  }
  
  // Validação especial para confirmação de senha
  if (input.id === 'confirmarSenha') {
    const senhaOriginal = document.getElementById('senhaCadastro').value;
    isValid = value === senhaOriginal && value.length > 0;
  }
  
  if (isValid) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
  } else {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
  }
  
  return isValid;
}

// ===== ACESSIBILIDADE =====
function melhorarAcessibilidade() {
  // Adicionar navegação por teclado nos modais
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      // Fechar modais abertos
      const modalsAbertos = document.querySelectorAll('.modal.show');
      modalsAbertos.forEach(modal => {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      });
    }
  });
  
  // Melhorar foco nos elementos
  const elementos = document.querySelectorAll('input, button, a');
  elementos.forEach(el => {
    el.addEventListener('focus', function() {
      this.style.outline = '2px solid #0d6efd';
      this.style.outlineOffset = '2px';
    });
    
    el.addEventListener('blur', function() {
      this.style.outline = '';
      this.style.outlineOffset = '';
    });
  });
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar todas as funcionalidades
  inicializarToggleSenha();
  inicializarFormularioLogin();
  inicializarFormularioCadastro();
  inicializarFormularioRecuperacao();
  aplicarMascaraTelefone();
  inicializarValidacaoTempoReal();
  melhorarAcessibilidade();
  
  // Verificar se usuário já está logado
  const usuarioLogado = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  if (usuarioLogado) {
    const dados = JSON.parse(usuarioLogado);
    mostrarToast(`Bem-vindo de volta, ${dados.nome}!`, 'info');
    
    // Opcional: redirecionar automaticamente
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  }
  
  console.log('🔐 Sistema de login inicializado com sucesso!');
});

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.LoginJMGames = {
  loginGoogle,
  loginFacebook,
  mostrarToast
};

