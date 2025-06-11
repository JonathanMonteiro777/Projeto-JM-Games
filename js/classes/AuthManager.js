// js/classes/AuthManager.js

import { isValidEmail, isNotEmpty, isValidPassword } from '../utils/validationUtils.js';
import { showToast } from '../utils/domUtils.js';

export class AuthManager {
    constructor() {
        // O construtor não precisa inicializar os formulários diretamente aqui.
        // Isso será feito pelo `main.js` ou `login.js` dependendo da página.
        // Apenas chamamos setupLogout e updateUI, que são para a navbar global.
        this.setupLogout(); // Configura o listener para o botão de logout na navbar (se existir)
        this.updateUI();    // Atualiza a navbar no carregamento da página (visibilidade de login/logout)
    }

    /**
     * Inicializa os event listeners para o formulário de login.
     * Deve ser chamado APENAS na página `login.html`.
     */
    initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return; // Garante que só executa se o formulário existir

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');

            const email = emailInput.value;
            const password = passwordInput.value;

            // --- Validação de campos ---
            let hasError = false;

            if (!isValidEmail(email)) {
                showToast('Por favor, insira um e-mail válido.', 'danger');
                emailInput.classList.add('is-invalid');
                hasError = true;
            } else {
                emailInput.classList.remove('is-invalid');
                emailInput.classList.add('is-valid'); // Adiciona valid para feedback visual
            }

            if (!isNotEmpty(password)) {
                showToast('Por favor, insira sua senha.', 'danger');
                passwordInput.classList.add('is-invalid');
                hasError = true;
            } else {
                passwordInput.classList.remove('is-invalid');
                passwordInput.classList.add('is-valid'); // Adiciona valid para feedback visual
            }

            if (hasError) return;

            // Simulação de login
            if (email === 'teste@teste.com' && password === '123456') {
                showToast('Login realizado com sucesso!', 'success');
                localStorage.setItem('loggedInUser', email); // Armazena estado de login
                this.updateUI(); // Atualiza a navbar APÓS o login
                setTimeout(() => window.location.href = 'index.html', 1000); // Redireciona
            } else {
                showToast('E-mail ou senha incorretos.', 'danger');
            }
        });

        // --- Adicionar validação em tempo real ao digitar ---
        const loginEmailInput = document.getElementById('loginEmail');
        const loginPasswordInput = document.getElementById('loginPassword'); // Adicionado
        
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
        // Adiciona validação para senha também (campo não vazio)
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
     * Deve ser chamado APENAS na página `register.html`.
     */
    initRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return; // Garante que só executa se o formulário existir

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
            if (password !== confirmPassword) {
                showToast('As senhas não coincidem.', 'danger');
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

        // --- Adicionar validação em tempo real ao digitar ---
        // Aprimorado para usar um loop e os IDs dos inputs
        const registerInputs = [
            document.getElementById('registerName'),
            document.getElementById('registerEmail'),
            document.getElementById('registerPassword'),
            document.getElementById('registerConfirmPassword')
        ];

        registerInputs.forEach(input => {
            if (input) { // Garante que o input existe
                input.addEventListener('input', () => {
                    let isValid = true;
                    if (input.id === 'registerEmail') {
                        isValid = isValidEmail(input.value);
                    } else if (input.id === 'registerPassword') {
                        isValid = isValidPassword(input.value);
                    } else if (input.id === 'registerConfirmPassword') {
                        const passwordInput = document.getElementById('registerPassword');
                        // Garante que a confirmação é válida APENAS se a senha principal também for
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
            }
        });

        // --- Adicionar funcionalidade de toggle de senha (olhinho) ---
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
     * Atualiza a interface da navbar (links de login/logout, nome do usuário).
     * Este método agora é público e pode ser chamado de qualquer lugar.
     */
    updateUI() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        const loginLink = document.getElementById('loginLink');
        const logoutButton = document.getElementById('logoutButton'); // Este deve ser um botão que existe no HTML
        const userNameDisplay = document.getElementById('loggedInUserName'); // Se você tiver um elemento para isso

        if (loggedInUser) {
            // Usuário logado
            if (loginLink) loginLink.style.display = 'none'; // Esconde o link "Entrar"

            if (logoutButton) {
                logoutButton.style.display = 'block'; // Mostra o botão "Sair"
                logoutButton.textContent = `Sair (${loggedInUser.split('@')[0]})`;
            }

            if (userNameDisplay) userNameDisplay.textContent = `Olá, ${loggedInUser.split('@')[0]}!`;
            
        } else {
            // Usuário deslogado
            if (loginLink) loginLink.style.display = 'block'; // Mostra o link "Entrar"

            if (logoutButton) {
                logoutButton.style.display = 'none'; // Esconde o botão "Sair"
            }
            if (userNameDisplay) userNameDisplay.textContent = '';
        }
    }

    /**
     * Configura o event listener para o botão de logout.
     * Este método agora é mais simples, pois a lógica de visibilidade está em updateUI().
     */
    setupLogout() {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            // Usa uma função de seta para manter o 'this' da instância AuthManager
            // ou .bind(this) se for uma função regular.
            logoutButton.addEventListener('click', (event) => {
                event.preventDefault(); // Previne o comportamento padrão do link/botão
                localStorage.removeItem('loggedInUser'); // Remove o estado de login
                showToast('Você foi desconectado.', 'info');
                this.updateUI(); // Atualiza a UI após o logout
                // Opcional: redirecionar para a página inicial ou de login
                // setTimeout(() => window.location.href = 'index.html', 500);
            });
        }
    }
}