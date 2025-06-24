// js/login-page.js

import { AuthManager } from './classes/AuthManager.js'; // Ajuste o caminho se necessário

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o AuthManager.
    // O construtor do AuthManager já cuida da navbar (setupLogout e updateUI).
    const auth = new AuthManager(); 

    // Inicializa AMBOS os formulários de login e registro, pois eles estão na mesma página.
    // Os métodos do AuthManager já verificam se os elementos existem antes de tentar inicializar.
    auth.initLoginForm();
    auth.initRegisterForm();

    // --- Lógica para alternar a visibilidade das seções dos formulários ---
    const loginSection = document.getElementById('login-section'); 
    const registerSection = document.getElementById('register-section'); 

    const showRegisterLink = document.getElementById('showRegisterLink'); 
    const showLoginLink = document.getElementById('showLoginLink');       

    // Função para mostrar a seção de login e esconder a de registro
    const showLoginForm = () => {
        if (loginSection) loginSection.style.display = 'block';
        if (registerSection) registerSection.style.display = 'none';
    };

    // Função para mostrar a seção de registro e esconder a de login
    const showRegisterForm = () => {
        if (loginSection) loginSection.style.display = 'none';
        if (registerSection) registerSection.style.display = 'block';
    };

    // Adiciona listeners para os links/botões que alternam
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (event) => {
            event.preventDefault(); 
            showRegisterForm();
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (event) => {
            event.preventDefault(); 
            showLoginForm();
        });
    }

    // Define qual formulário mostrar inicialmente (por padrão, o de login)
    // Isso garante que, ao carregar a página, o formulário de login esteja visível.
    showLoginForm(); 
});