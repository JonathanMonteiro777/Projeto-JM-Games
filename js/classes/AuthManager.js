/**
 * @file AuthManager.js
 * @description Gerencia a autenticação de usuários, incluindo login, registro e
 * a atualização da interface do usuário (UI) com base no status de autenticação.
 * Utiliza validações de formulário e persistência simples com localStorage.
 * @version 1.0.0
 */

import { isValidEmail, isNotEmpty, isValidPassword } from '../utils/validationUtils.js';
import { showToast } from '../utils/domUtils.js';

/**
 * Gerencia a lógica de autenticação de usuários e a interação com a UI.
 */
export class AuthManager {
    /**
     * Cria uma instância do AuthManager.
     * Configura o listener para o botão de logout e atualiza a UI da navbar
     * com base no status de login ao carregar a página.
     */
    constructor() {
        this.setupLogout();
        this.updateUI();
    }

    /**
     * Inicializa os event listeners para o formulário de login.
     * Este método deve ser chamado apenas na página que contém o formulário de login (`login.html`).
     */
    initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');

            const email = emailInput.value;
            const password = passwordInput.value;

            let hasError = false;

            // Validação de e-mail
            if (!isValidEmail(email)) {
                showToast('Por favor, insira um e-mail válido.', 'danger');
                emailInput.classList.add('is-invalid');
                hasError = true;
            } else {
                emailInput.classList.remove('is-invalid');
                emailInput.classList.add('is-valid');
            }

            // Validação de senha
            if (!isNotEmpty(password)) {
                showToast('Por favor, insira sua senha.', 'danger');
                passwordInput.classList.add('is-invalid');
                hasError = true;
            } else {
                passwordInput.classList.remove('is-invalid');
                passwordInput.classList.add('is-valid');
            }

            if (hasError) return;

            // Simulação de login
            if (email === 'teste@teste.com' && password === '123456') {
                showToast('Login realizado com sucesso!', 'success');
                localStorage.setItem('loggedInUser', email);
                this.updateUI(); // Atualiza a navbar APÓS o login
                setTimeout(() => window.location.href = 'index.html', 1000);
            } else {
                showToast('E-mail ou senha incorretos.', 'danger');
                // Adiciona feedback visual para falha de login nos campos
                emailInput.classList.remove('is-valid');
                emailInput.classList.add('is-invalid');
                passwordInput.classList.remove('is-valid');
                passwordInput.classList.add('is-invalid');
            }
        });

        // Adicionar validação em tempo real ao digitar
        const loginEmailInput = document.getElementById('loginEmail');
        const loginPasswordInput = document.getElementById('loginPassword');

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

        if (loginPasswordInput) {
            loginPasswordInput.addEventListener('input', () => {
                if (isNotEmpty(loginPasswordInput.value)) {
                    loginPasswordInput.classList.remove('is-invalid');
                    loginPasswordInput.classList.add('is-valid');
                } else {
                    loginPasswordInput.classList.remove('is-valid');
                    loginPasswordInput.classList.add('is-invalid');
                }
            });
        }
    }

    /**
     * Inicializa os event listeners para o formulário de registro.
     * Este método deve ser chamado apenas na página que contém o formulário de registro.
     */
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
                nameInput.classList.add('is-valid');
            }

            // Validação de E-mail
            if (!isValidEmail(email)) {
                showToast('Por favor, insira um e-mail válido.', 'danger');
                emailInput.classList.add('is-invalid');
                hasError = true;
            } else {
                emailInput.classList.remove('is-invalid');
                emailInput.classList.add('is-valid');
            }

            // Validação de Senha
            if (!isValidPassword(password)) {
                showToast('A senha deve ter no mínimo 6 caracteres.', 'danger');
                passwordInput.classList.add('is-invalid');
                hasError = true;
            } else {
                passwordInput.classList.remove('is-invalid');
                passwordInput.classList.add('is-valid');
            }

            // Validação de Confirmação de Senha
            if (password !== confirmPassword || !isNotEmpty(confirmPassword)) { // Garante que não está vazio também
                showToast('As senhas não coincidem ou a confirmação está vazia.', 'danger');
                confirmPasswordInput.classList.add('is-invalid');
                hasError = true;
            } else {
                confirmPasswordInput.classList.remove('is-invalid');
                confirmPasswordInput.classList.add('is-valid');
            }

            if (hasError) return;

            // Simulação de cadastro
            const newUser = { name, email, password };
            console.log('Novo usuário cadastrado (simulado):', newUser);
            showToast('Cadastro realizado com sucesso!', 'success');
            setTimeout(() => window.location.href = 'login.html', 1000);
        });

        // Adicionar validação em tempo real ao digitar
        const registerInputs = [
            document.getElementById('registerName'),
            document.getElementById('registerEmail'),
            document.getElementById('registerPassword'),
            document.getElementById('registerConfirmPassword')
        ];

        registerInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    let isValid = true;
                    if (input.id === 'registerEmail') {
                        isValid = isValidEmail(input.value);
                    } else if (input.id === 'registerPassword') {
                        isValid = isValidPassword(input.value);
                    } else if (input.id === 'registerConfirmPassword') {
                        const passwordInput = document.getElementById('registerPassword');
                        // Confirmação é válida se a senha principal também é e elas coincidem, e não está vazia
                        isValid = isValidPassword(passwordInput.value) && input.value === passwordInput.value && isNotEmpty(input.value);
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
            }
        });

        // Adicionar funcionalidade de toggle de senha (olhinho)
        const togglePasswordButtons = document.querySelectorAll('.toggle-password');
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.target;
                const passwordField = document.getElementById(targetId);
                const icon = button.querySelector('i');

                if (passwordField && icon) { // Garante que os elementos existem
                    if (passwordField.type === 'password') {
                        passwordField.type = 'text';
                        icon.classList.remove('bi-eye-fill');
                        icon.classList.add('bi-eye-slash-fill');
                    } else {
                        passwordField.type = 'password';
                        icon.classList.remove('bi-eye-slash-fill');
                        icon.classList.add('bi-eye-fill');
                    }
                }
            });
        });
    }

    /**
     * Atualiza a interface da navbar (links de login/logout, nome do usuário).
     * Este método é público e pode ser chamado de qualquer lugar para refrescar a UI de autenticação.
     */
    updateUI() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        const loginLink = document.getElementById('loginLink');
        const logoutButton = document.getElementById('logoutButton');
        const userNameDisplay = document.getElementById('loggedInUserName');

        if (loggedInUser) {
            // Usuário logado
            if (loginLink) loginLink.style.display = 'none';

            if (logoutButton) {
                logoutButton.style.display = 'block';
                // Exibe apenas a parte do e-mail antes do '@'
                logoutButton.textContent = `Sair (${loggedInUser.split('@')[0]})`;
            }

            if (userNameDisplay) userNameDisplay.textContent = `Olá, ${loggedInUser.split('@')[0]}!`;

        } else {
            // Usuário deslogado
            if (loginLink) loginLink.style.display = 'block';

            if (logoutButton) {
                logoutButton.style.display = 'none';
            }
            if (userNameDisplay) userNameDisplay.textContent = '';
        }
    }

    /**
     * Configura o event listener para o botão de logout.
     * Este método garante que o botão de logout funcione corretamente quando presente na página.
     * @private
     */
    setupLogout() {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', (event) => {
                event.preventDefault();
                localStorage.removeItem('loggedInUser');
                showToast('Você foi desconectado.', 'info');
                this.updateUI(); // Atualiza a UI após o logout
                // Redirecionar para a página inicial ou de login
                 setTimeout(() => window.location.href = 'index.html', 500);
            });
        }
    }
}