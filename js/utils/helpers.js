/**
 * @file helper.js
 * @description Módulo de funções utilitárias gerais que não se encaixam em categorias mais específicas,
 * como manipulação de DOM ou validações.
 * @version 1.0.0
 */

/**
 * Rola a janela do navegador suavemente para o topo da página.
 */
export function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Adiciona um comportamento de rolagem suave
    });
}