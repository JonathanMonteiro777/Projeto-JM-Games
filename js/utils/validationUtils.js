// js/utils/validationUtils.js

/**
 * Valida o formato de um e-mail.
 * @param {string} email - O endereço de e-mail a ser validado.
 * @returns {boolean} - True se o e-mail for válido, false caso contrário.
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida se uma string não está vazia ou contém apenas espaços em branco.
 * @param {string} value - O valor a ser validado.
 * @returns {boolean} - True se o valor não estiver vazio, false caso contrário.
 */
export function isNotEmpty(value) {
    return value.trim() !== '';
}

/**
 * Valida se a senha atende aos requisitos mínimos.
 * @param {string} password - A senha a ser validada.
 * @returns {boolean} - True se a senha for válida, false caso contrário.
 */
export function isValidPassword(password) {
    // Exemplo: Mínimo de 6 caracteres
    return password.length >= 6;
}

// Você pode adicionar mais funções de validação aqui, ex: isValidCPF, isValidPhone, etc.