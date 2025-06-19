// --- Importações de classes e utilitários ---
import { CarrinhoManager } from './classes/CarrinhoManager.js';
import { AuthManager } from './classes/AuthManager.js';
import { FavoritosManager } from './classes/FavoritosManager.js';
import { handleScrollToTopButton, showToast } from './utils/domUtils.js';
import { fetchGames } from './services/rawgApi.js';
import { scrollToTop } from './utils/helpers.js';
import { SearchManager } from './classes/BuscaManager.js';


// --- FUNÇÕES DE RENDERIZAÇÃO ---

// Função para renderizar jogos em uma seção específica
async function renderGamesToSection(gamesArray, containerSelector, carrinhoManager, favoritosManager) {
    // CORREÇÃO 1: Use gamesArray consistentemente
    console.log('TRACE: renderGamesToSection', gamesArray, containerSelector);
    console.log('TRACE: Jogos recebidos para renderizar:', gamesArray);

    const container = document.querySelector(containerSelector);
    if (!container) {
        console.warn(`Container com ID "${containerSelector}" não encontrado.`);
        return;
    }
    console.log('TRACE: Container encontrado:', container);

    container.innerHTML = ''; // Limpa o conteúdo atual da seção

    // CORREÇÃO 1: Use gamesArray consistentemente
    if (!Array.isArray(gamesArray) || gamesArray.length === 0) { // Verifica se é um array e se está vazio
        console.warn('Nenhum jogo encontrado para renderizar.');
        container.innerHTML = '<p class="text-center text-muted">Nenhum jogo encontrado.</p>';
        return;
    }

    // Renderiza cada jogo na seção
    gamesArray.forEach(game => {
        console.log(`TRACE: Processando jogo: ${game.name}, imagem: ${game.background_image}`);

        const gameCardHtml = createGameCardHtml(game, favoritosManager); // Chama a nova função para criar o HTML do card

        container.insertAdjacentHTML('beforeend', gameCardHtml);
    });

    console.log(`TRACE: renderGamesToSection finalizada para "${containerSelector}".`);
}

// NOVA FUNÇÃO: Cria e retorna a string HTML de um card de jogo
function createGameCardHtml(game, favoritosManager) {
    const stars = '⭐'.repeat(Math.round(game.rating || 0));
    const isFavorited = favoritosManager.isFavorited(game.id);

    return `
     <div class="col-md-4 col-sm-6 mb-4">
            <div class="card h-100 shadow-light game-card-link">
                <a href="pages/detalhes.html?id=${game.id}" class="card-link-overlay">
                    <img src="${game.background_image || 'img/placeholder.PNG'}" class="card-img-top" alt="${game.name || 'nome do jogo'}">
                    <div class="card-body text-center d-flex flex-column">
                        <h5 class="card-title fw-bold">${game.name || 'Nome Desconhecido'}</h5>
                        <p class="card-text flex-grow-1">
                            Lançamento: ${game.released || 'N/A'}<br>
                            Avaliação: <span>${game.rating || 'N/A'}/5</span>
                        </p>
                        <p class="text-price text-success">R$${((game.id % 100) + 50).toFixed(2)}</p>
                        <p class="text-warning text-sm">
                            ${stars} (${game.rating || 'N/A'}/5)
                        </p>
                    </div>
                    <div class="view-details-overlay">Ver Detalhes</div>
                </a>
                <div class="d-flex justify-content-around align-items-center mt-auto p-3 bg-light border-top">
                    <a href="#" class="btn btn-gamer flex-fill me-2 add-to-cart"
                        data-product-id="${game.id}"
                        data-product-name="${game.name}"
                        data-product-price="${((game.id % 100) + 50).toFixed(2)}"
                        data-product-image="${game.background_image || 'img/placeholder.PNG'}">
                        <i class="bi bi-cart-plus-fill me-2"></i>
                        Adicionar
                    </a>
                    <button class="btn btn-outline-warning add-to-favorites"
                        data-product-id="${game.id}"
                        data-product-name="${game.name}"
                        data-product-price="${((game.id % 100) + 50).toFixed(2)}"
                        data-product-image="${game.background_image || 'img/placeholder.PNG'}">
                        <i class="bi ${favoritosManager.isFavorited(game.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
                    </button>
                </div>
            </div>
        </div>`;

}

// NOVA FUNÇÃO: Extrai dados do produto de um botão
function getProductDataFromButton(button) {
    return {
        id: button.dataset.productId,
        name: button.dataset.productName,
        price: parseFloat(button.dataset.productPrice),
        image: button.dataset.productImage
    };
}


// --- Carrega e renderiza os Destaques ---
async function loadAndRenderGames(carrinhoInstance, favoritosInstance) {
    try {
        // Chamada para jogos de Destaques (Ranking)
        const apiResponse = await fetchGames({ page_size: 15, ordering: '-rating' }); // CORREÇÃO 2: Renomeia para apiResponse
        const ratedGames = apiResponse.results; // <--- CORREÇÃO 2: Acessa a propriedade 'results'

        renderGamesToSection(ratedGames, '#ranking-games-container', carrinhoInstance, favoritosInstance); // Passa o array correto

        showToast('Jogos carregados da API RAWG!', 'success');
    } catch (error) {
        showToast('Erro ao carregar jogos da API. Verifique sua conexão ou chave de API.', 'danger');
        console.error('Erro em loadAndRenderGames:', error);
    }
}

// --- Event LISTENERS ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('TRACE: DOMContentLoaded disparado.');

    // --- Inicializa Gerenciadores ---
    const carrinho = new CarrinhoManager();
    const auth = new AuthManager();
    const favoritos = new FavoritosManager();
    const searchManager = new SearchManager(carrinho, favoritos);


    // Carrega e renderiza os jogos das seções principais
    await loadAndRenderGames(carrinho, favoritos);

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