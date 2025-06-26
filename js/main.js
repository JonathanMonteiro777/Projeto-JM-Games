/**
 * @file main.js
 * @description Ponto de entrada principal da aplicação JM Games.
 * Gerencia a inicialização das classes, a delegação de eventos global
 * e a interação entre os diferentes módulos da aplicação.
 * @version 1.0.0
 */

// --- Importações de classes e utilitários ---
import { CarrinhoManager } from './classes/CarrinhoManager.js';
import { AuthManager } from './classes/AuthManager.js';
import { FavoritosManager } from './classes/FavoritosManager.js';
import { handleScrollToTopButton, showToast } from './utils/domUtils.js';
import { scrollToTop } from './utils/helpers.js';
import { SearchManager } from './classes/BuscaManager.js';


/**
 * Extrai os dados de um produto a partir dos atributos `data-*` de um botão HTML.
 * @param {HTMLElement} button - O elemento do botão HTML contendo os atributos `data-product-*`.
 * @returns {Object} Um objeto contendo o id, nome, preço e imagem do produto.
 */
function getProductDataFromButton(button) {
    return {
        id: button.dataset.productId,
        name: button.dataset.productName,
        price: parseFloat(button.dataset.productPrice),
        image: button.dataset.productImage
    };
}

/**
 * Event listener principal para o carregamento do DOM.
 * Inicializa os gerenciadores e configura os event listeners globais.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('TRACE: DOMContentLoaded disparado.');

    // --- Inicializa Gerenciadores ---
    /** @type {CarrinhoManager} */
    const carrinho = new CarrinhoManager();
    /** @type {AuthManager} */
    const auth = new AuthManager();
    /** @type {FavoritosManager} */
    const favoritos = new FavoritosManager();
    /** @type {SearchManager} */
    const searchManager = new SearchManager(carrinho, favoritos); // Passa instâncias de Carrinho e Favoritos

    // --- Delegação de Eventos para o corpo do documento ---
    /**
     * Event listener para o clique em qualquer lugar do documento.
     * @param {Event} event - O objeto do evento de clique.
     */
    document.body.addEventListener('click', (event) => {
        const target = event.target; // O elemento DOM que foi clicado

        /**
         * Lógica para o botão 'Comprar' (add-to-cart).
         * Usa `closest` para garantir que o clique em um elemento filho (ex: ícone)
         * dentro do botão ainda ative a lógica do botão pai.
         */
        const addToCartButton = target.closest('.add-to-cart');
        if (addToCartButton) {
            event.preventDefault(); // Previne o comportamento padrão do botão
            const produto = getProductDataFromButton(addToCartButton);
            carrinho.adicionarItem(produto);
            showToast(`${produto.name} adicionado ao carrinho!`, 'success');
            const offcanvasCarrinho = new bootstrap.Offcanvas(document.getElementById('offcanvasCarrinho'));
            offcanvasCarrinho.show();
            console.log('TRACE: Botão "Comprar" clicado via delegação.');
            return; // Sai da função para não processar outros `if`s
        }

        /**
         * Lógica para o botão 'Adicionar aos Favoritos' (add-to-favorites).
         */
        const addToFavoritesButton = target.closest('.add-to-favorites');
        if (addToFavoritesButton) {
            event.preventDefault();
            const produto = getProductDataFromButton(addToFavoritesButton);
            // Chama a lógica de adicionar/remover do FavoritosManager, que já dispara o toast apropriado.
            // O retorno indica se o item AGORA está favoritado (true) ou não (false).
            const isNowFavorited = favoritos.adicionarRemoverItem(produto);

            // Atualiza o ícone visualmente no botão que foi clicado
            const icon = addToFavoritesButton.querySelector('i.bi');
            if (icon) {
                // Usa o estado atual VERDADEIRO do FavoritosManager para garantir consistência
                icon.classList.toggle('bi-heart-fill', favoritos.isFavorited(produto.id));
                icon.classList.toggle('bi-heart', !favoritos.isFavorited(produto.id));
            }
            console.log('TRACE: Botão "Adicionar aos Favoritos" clicado via delegação.');
            return;
        }
    });

    // --- Eventos Específicos para elementos com IDs fixos ---

    /**
     * Gerencia o clique no botão "Limpar Carrinho" dentro do offcanvas.
     */
    const btnLimparCarrinho = document.getElementById('btn-limpar-carrinho');
    if (btnLimparCarrinho) {
        btnLimparCarrinho.addEventListener('click', () => {
            carrinho.limparCarrinho();
        });
    }

    /**
     * Gerencia o clique no botão "Limpar Favoritos" dentro do offcanvas.
     */
    const btnLimparFavoritos = document.getElementById('btn-limpar-favoritos');
    if (btnLimparFavoritos) {
        btnLimparFavoritos.addEventListener('click', () => {
            favoritos.limparFavoritos();
        });
    }

    /**
     * Configura o botão "Voltar ao Topo":
     * - Mostra/esconde o botão com base na posição do scroll.
     * - Rolagem suave para o topo ao clicar.
     */
    const btnVoltarTopo = document.getElementById('voltar-topo');
    if (btnVoltarTopo) {
        window.addEventListener('scroll', handleScrollToTopButton);
        btnVoltarTopo.addEventListener('click', scrollToTop);
    }

    // Exibe um toast de boas-vindas ao carregar a página
    showToast('Bem-vindo à JM Games!', 'info');

    console.log('TRACE: DOMContentLoaded finalizado.');
});