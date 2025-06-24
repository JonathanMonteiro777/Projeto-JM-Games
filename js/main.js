// --- Importações de classes e utilitários ---
import { CarrinhoManager } from './classes/CarrinhoManager.js';
import { AuthManager } from './classes/AuthManager.js';
import { FavoritosManager } from './classes/FavoritosManager.js';
import { handleScrollToTopButton, showToast } from './utils/domUtils.js';
import { scrollToTop } from './utils/helpers.js';
import { SearchManager } from './classes/BuscaManager.js';



// NOVA FUNÇÃO: Extrai dados do produto de um botão
function getProductDataFromButton(button) {
    return {
        id: button.dataset.productId,
        name: button.dataset.productName,
        price: parseFloat(button.dataset.productPrice),
        image: button.dataset.productImage
    };
}

// --- Event LISTENERS ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('TRACE: DOMContentLoaded disparado.');

    // --- Inicializa Gerenciadores ---
    const carrinho = new CarrinhoManager();
    const auth = new AuthManager();
    const favoritos = new FavoritosManager();
    const searchManager = new SearchManager(carrinho, favoritos);


    // --- Delegação de Eventos ---

    document.body.addEventListener('click', (event) => {
        const target = event.target; // O elemento DOM que foi clicado

        // Lógica para o botão 'Comprar' (add-to-cart)
        // Usa 'closest' para garantir que mesmo um clique no ícone dentro do botão funcione
        const addToCartButton = target.closest('.add-to-cart');
        if (addToCartButton) {
            event.preventDefault(); // Previne o comportamento padrão do link
            const produto = getProductDataFromButton(addToCartButton);
            carrinho.adicionarItem(produto);
            showToast(`${produto.name} adicionado ao carrinho!`, 'success');
            const offcanvasCarrinho = new bootstrap.Offcanvas(document.getElementById('offcanvasCarrinho'));
            offcanvasCarrinho.show();
            console.log('TRACE: Botão "Comprar" clicado via delegação.');
            return; // Importante para sair e não processar outros ifs
        }

        // Lógica para o botão 'Adicionar aos Favoritos' (add-to-favorites)
        const addToFavoritesButton = target.closest('.add-to-favorites');
        if (addToFavoritesButton) {
            event.preventDefault();
            const produto = getProductDataFromButton(addToFavoritesButton);
            const isNowFavorited = favoritos.adicionarRemoverItem(produto);

            // Atualiza o ícone visualmente no botão que foi clicado
            const icon = addToFavoritesButton.querySelector('i.bi');
            if (icon) {
                icon.classList.toggle('bi-heart-fill', isNowFavorited);
                icon.classList.toggle('bi-heart', !isNowFavorited);
            }
            showToast(`${produto.name} ${isNowFavorited ? 'adicionado' : 'removido'} dos favoritos!`, 'info');
            console.log('TRACE: Botão "Adicionar aos Favoritos" clicado via delegação.');
            return;
        }
    });

    // --- Eventos Específicos ---

    // Botão "Limpar Carrinho" dentro do offcanvas
    const btnLimparCarrinho = document.getElementById('btn-limpar-carrinho');
    if (btnLimparCarrinho) {
        btnLimparCarrinho.addEventListener('click', () => {
            carrinho.limparCarrinho();
        });
    }

    // Botão "Limpar favoritos" dentro do offcanvas
    const btnLimparFavoritos = document.getElementById('btn-limpar-favoritos');
    if (btnLimparFavoritos) {
        btnLimparFavoritos.addEventListener('click', () => {
            favoritos.limparFavoritos();
        });
    }

    // Botão "Voltar ao Topo"
    const btnVoltarTopo = document.getElementById('voltar-topo');
    if (btnVoltarTopo) {
        window.addEventListener('scroll', handleScrollToTopButton);
        btnVoltarTopo.addEventListener('click', scrollToTop);
    }

    // Exibe um toast de boas-vindas ao carregar a página
    showToast('Bem-vindo à JM Games!', 'info');

    console.log('TRACE: DOMContentLoaded finalizado.');
});