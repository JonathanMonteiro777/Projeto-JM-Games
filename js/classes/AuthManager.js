// js/classes/AuthManager.js

import { isValidEmail, isNotEmpty, isValidPassword } from '../utils/validationUtils.js';
import { showToast } from '../utils/domUtils.js';

export class AuthManager {
    constructor() {
        this.initLoginForm();
        this.initRegisterForm();
        this.setupLogout(); // Para o botão de logout no header, se aplicável
    }

    
     // === Inicializa o formulário de login e seus event listeners ===
     
    initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');

            const email = emailInput.value;
            const password = passwordInput.value;

            // Simples validação de exemplo
            if (!isValidEmail(email)) {
                showToast('Por favor, insira um e-mail válido.', 'danger');
                emailInput.classList.add('is-invalid');
                return;
            } else {
                emailInput.classList.remove('is-invalid');
            }

            if (!isNotEmpty(password)) {
                showToast('Por favor, insira sua senha.', 'danger');
                passwordInput.classList.add('is-invalid');
                return;
            } else {
                passwordInput.classList.remove('is-invalid');
            }

            // Simulação de login
            if (email === 'teste@teste.com' && password === '123456') {
                showToast('Login realizado com sucesso!', 'success');
                localStorage.setItem('loggedInUser', email); // Armazena estado de login
                // Redirecionar para página inicial ou dashboard do usuário
                setTimeout(() => window.location.href = 'index.html', 1000);
            } else {
                showToast('E-mail ou senha incorretos.', 'danger');
            }
        });

        // Adicionar validação em tempo real ao digitar 
        const loginEmailInput = document.getElementById('loginEmail');
        if (loginEmailInput) {
            loginEmailInput.addEventListener('input', () => {
                if (isValidEmail(loginEmailInput.value)) {
                    loginEmailInput.classList.remove('is-invalid');
                    loginEmailInput.classList.add('is-valid');
                } else {
                    loginEmailInput.classList.remove('is-valid');
                    loginEmailInput.classList.add('is-invalid');
                }
            });
        }
    }

    
     // === Inicializa o formulário de cadastro e seus event listeners ===
     
    initRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;

        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const nameInput = document.getElementById('registerName');
            const emailInput = document.getElementById('registerEmail');
            const passwordInput = document.getElementById('registerPassword');
            const confirmPasswordInput = document.getElementById('registerConfirmPassword');

            const name = nameInput.value;
            const email = emailInput.value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            let hasError = false;

            // Validação de Nome
            if (!isNotEmpty(name)) {
                showToast('Por favor, insira seu nome.', 'danger');
                nameInput.classList.add('is-invalid');
                hasError = true;
            } else {
                nameInput.classList.remove('is-invalid');
            }

            // Validação de E-mail
            if (!isValidEmail(email)) {
                showToast('Por favor, insira um e-mail válido.', 'danger');
                emailInput.classList.add('is-invalid');
                hasError = true;
            } else {
                emailInput.classList.remove('is-invalid');
            }

            // Validação de Senha
            if (!isValidPassword(password)) {
                showToast('A senha deve ter no mínimo 6 caracteres.', 'danger');
                passwordInput.classList.add('is-invalid');
                hasError = true;
            } else {
                passwordInput.classList.remove('is-invalid');
            }

            // Validação de Confirmação de Senha
            if (password !== confirmPassword) {
                showToast('As senhas não coincidem.', 'danger');
                confirmPasswordInput.classList.add('is-invalid');
                hasError = true;
            } else {
                confirmPasswordInput.classList.remove('is-invalid');
            }

            if (hasError) return;

            // Simulação de cadastro
            const newUser = { name, email, password };
            // Na vida real, você enviaria isso para um backend
            console.log('Novo usuário cadastrado (simulado):', newUser);
            showToast('Cadastro realizado com sucesso!', 'success');
            // Redirecionar para a página de login
            setTimeout(() => window.location.href = 'login.html', 1000);
        });

        // Adicionar validação em tempo real ao digitar 
        document.querySelectorAll('#registerForm .form-input').forEach(input => {
            input.addEventListener('input', () => {
                let isValid = true;
                if (input.id === 'registerEmail') {
                    isValid = isValidEmail(input.value);
                } else if (input.id === 'registerPassword') {
                    isValid = isValidPassword(input.value);
                } else if (input.id === 'registerConfirmPassword') {
                    const passwordInput = document.getElementById('registerPassword');
                    isValid = input.value === passwordInput.value && isNotEmpty(input.value);
                } else { // Para nome ou outros campos de texto simples
                    isValid = isNotEmpty(input.value);
                }

                if (isValid) {
                    input.classList.remove('is-invalid');
                    input.classList.add('is-valid');
                } else {
                    input.classList.remove('is-valid');
                    input.classList.add('is-invalid');
                }
            });
        });

        // Adicionar funcionalidade de toggle de senha (olhinho)
        const togglePasswordButtons = document.querySelectorAll('.toggle-password');
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.target;
                const passwordField = document.getElementById(targetId);
                const icon = button.querySelector('i');

                if (passwordField.type === 'password') {
                    passwordField.type = 'text';
                    icon.classList.remove('bi-eye-fill');
                    icon.classList.add('bi-eye-slash-fill');
                } else {
                    passwordField.type = 'password';
                    icon.classList.remove('bi-eye-slash-fill');
                    icon.classList.add('bi-eye-fill');
                }
            });
        });
    }

    /**
     * Configura o event listener para o botão de logout.
     * Assumindo que você tem um link/botão com a ID 'logoutButton'
     * e um elemento onde o nome do usuário logado é exibido, ex: 'loggedInUserName'.
     */
    setupLogout() {
        const logoutButton = document.getElementById('logoutButton');
        const loginLink = document.getElementById('loginLink'); // Link para Login
        const promoLink = document.querySelector('a[href="#"][aria-current="page"]'); // Promoções, etc.
        const navItems = document.querySelector('.navbar-nav'); // Ul da navbar
        const searchForm = document.querySelector('form[role="search"]');

        const userNameDisplay = document.getElementById('loggedInUserName'); // Elemento para mostrar o nome do usuário

        // Função para atualizar a UI com base no estado de login
        const updateUI = () => {
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (loggedInUser) {
                // Usuário logado
                if (loginLink) loginLink.style.display = 'none'; // Esconde o link de login
                if (logoutButton) {
                    if (!logoutButton.parentElement) { // Se o botão ainda não estiver no DOM
                        const logoutItem = document.createElement('li');
                        logoutItem.classList.add('nav-item');
                        logoutItem.innerHTML = `<a class="nav-link" href="#" id="logoutButton">Sair (${loggedInUser.split('@')[0]})</a>`;
                        if (navItems) navItems.appendChild(logoutItem);
                        this.setupLogout(); // Re-configura o listener para o novo botão
                    } else {
                         logoutButton.textContent = `Sair (${loggedInUser.split('@')[0]})`;
                         logoutButton.style.display = 'block';
                    }
                }
                // Exibe o nome do usuário se tiver um elemento para isso
                // if (userNameDisplay) userNameDisplay.textContent = `Olá, ${loggedInUser.split('@')[0]}!`;

                // Pode mostrar outros links/funcionalidades específicas para logados
            } else {
                // Usuário deslogado
                if (loginLink) loginLink.style.display = 'block';
                if (logoutButton) {
                    // Remove o botão de logout se ele existir
                    if (logoutButton.parentElement) {
                        logoutButton.parentElement.remove();
                    }
                }
                // Esconde o nome do usuário
                // if (userNameDisplay) userNameDisplay.textContent = '';
                // Pode esconder links/funcionalidades específicas para logados
            }
        };

        // Adiciona listener ao botão de logout (se existir e não tiver um listener já)
        if (logoutButton) {
             // Remove qualquer listener anterior para evitar duplicação se a UI for atualizada
            logoutButton.removeEventListener('click', this._logoutHandler);
            this._logoutHandler = () => {
                localStorage.removeItem('loggedInUser'); // Remove o estado de login
                showToast('Você foi desconectado.', 'info');
                updateUI(); // Atualiza a UI
                // Opcional: redirecionar para a página inicial ou de login
                // setTimeout(() => window.location.href = 'index.html', 500);
            };
            logoutButton.addEventListener('click', this._logoutHandler);
        }

        // Chama a função para atualizar a UI no carregamento da página
        updateUI();
    }
}