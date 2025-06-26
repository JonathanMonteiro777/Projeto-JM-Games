/**
 * @file login-page.js
 * @description Gerencia a autenticação de usuários (login e registro) na página,
 * utilizando o AuthManager, e controla a alternância de visibilidade entre os formulários
 * de login e registro.
 * @version 1.0.0
 */

import { AuthManager } from './classes/AuthManager.js'; // Ajuste o caminho conforme a estrutura do seu projeto

/**
 * Executa a lógica principal da página de login/registro após o carregamento completo do DOM.
 * Isso inclui a inicialização do AuthManager e a configuração da alternância de formulários.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o AuthManager.
    // O construtor do AuthManager já cuida da configuração da barra de navegação (ex: setupLogout e updateUI),
    // e os métodos initLoginForm/initRegisterForm cuidam da lógica dos formulários.
    const auth = new AuthManager();

    // Inicializa AMBOS os manipuladores de formulário de login e registro.
    // Os métodos do AuthManager internamente verificam a existência dos elementos HTML
    // antes de tentar configurar os listeners.
    auth.initLoginForm();
    auth.initRegisterForm();

    // --- Lógica para alternar a visibilidade das seções dos formulários ---
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');

    const showRegisterLink = document.getElementById('showRegisterLink');
    const showLoginLink = document.getElementById('showLoginLink');

    /**
     * Define a visibilidade inicial da página, mostrando o formulário de login e ocultando o de registro.
     * Esta função é chamada ao carregar a página para garantir o estado inicial correto.
     */
    const showLoginForm = () => {
        if (loginSection) {
            loginSection.style.display = 'block'; // Torna a seção de login visível
        }
        if (registerSection) {
            registerSection.style.display = 'none'; // Oculta a seção de registro
        }
    };

    /**
     * Altera a visibilidade, mostrando o formulário de registro e ocultando o de login.
     */
    const showRegisterForm = () => {
        if (loginSection) {
            loginSection.style.display = 'none'; // Oculta a seção de login
        }
        if (registerSection) {
            registerSection.style.display = 'block'; // Torna a seção de registro visível
        }
    };

    // Adiciona event listeners aos elementos que alternam a exibição dos formulários.
    // Isso garante que os cliques nos links/botões correspondentes ativem a função correta.
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (event) => {
            event.preventDefault(); // Impede o comportamento padrão do link (navegação)
            showRegisterForm();
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (event) => {
            event.preventDefault(); // Impede o comportamento padrão do link
            showLoginForm();
        });
    }

    // Define qual formulário é exibido por padrão ao carregar a página.
    // Por convenção, o formulário de login é o primeiro a ser mostrado.
    showLoginForm();
});