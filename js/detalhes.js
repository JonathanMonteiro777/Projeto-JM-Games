// js/detalhes.js

import { fetchGameById } from './services/rawgApi.js';
import { showToast, handleScrollToTopButton } from './utils/domUtils.js'; // handleScrollToTopButton é de domUtils
import { CarrinhoManager } from './classes/CarrinhoManager.js';
import { AuthManager } from './classes/AuthManager.js';
import { FavoritosManager } from './classes/FavoritosManager.js';
import { scrollToTop } from './utils/helpers.js'; // scrollToTop é de helpers

// Função para renderizar os detalhes do jogo na página
// Agora recebe a instância de FavoritosManager para verificar o estado do favorito
function renderGameDetails(game, favoritosManager) { // <-- MUDANÇA: Adicionado 'favoritosManager'
    const detailsSection = document.getElementById('game-details-section');
    if (!detailsSection) {
        console.error('ERRO: Seção de detalhes do jogo não encontrada no HTML.');
        return;
    }

    // Verifica se o jogo é favorito usando a instância passada
    const isFavorited = favoritosManager.isFavorited(game.id); // <-- CORRIGIDO: Usa a instância
    const stars = '⭐'.repeat(Math.round(game.rating || 0));

    detailsSection.innerHTML = `
      <div class="container py-5 bg-dark text-white">
        <div class="row">
            <div class="col-md-5 mb-4">
                <img src="${game.background_image || '../img/placeholder.jpg'}" class="img-fluid rounded shadow-lg" alt="${game.name}">
            </div>
            <div class="col-md-7 mb-4">
                <h1 class="display-4 fw-bold mb-3">${game.name || 'Nome Desconhecido'}</h1>
                <p class="lead">${game.description_raw ? game.description_raw.substring(0, 500) + '...' : 'Sem descrição.'}</p>
                <ul class="list-unstyled">
                    <li><strong>Lançamento:</strong> ${game.released || 'N/A'}</li>
                    <li><strong>Avaliação:</strong> ${game.rating || 'N/A'} / 5 (${stars})</li>
                    <li><strong>Gêneros:</strong> ${game.genres && game.genres.length > 0 ? game.genres.map(g => g.name).join(', ') : 'N/A'}</li>
                    <li><strong>Plataformas:</strong> ${game.platforms && game.platforms.length > 0 ? game.platforms.map(p => p.platform.name).join(', ') : 'N/A'}</li>
                    <li><strong>Desenvolvedoras:</strong> ${game.developers && game.developers.length > 0 ? game.developers.map(d => d.name).join(', ') : 'N/A'}</li>
                    <li><strong>Website:</strong> ${game.website ? `<a href="${game.website}" target="_blank" class="text-info">${game.website}</a>` : 'N/A'}</li>
                </ul>
                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-gamer btn-lg add-to-cart-details"
                        data-product-id="${game.id}"
                        data-product-name="${game.name}"
                        data-product-price="${((game.id % 100) + 50).toFixed(2)}"
                        data-product-image="${game.background_image || '../img/placeholder.jpg'}">
                        Comprar por R$${((game.id % 100) + 50).toFixed(2)}
                    </button>
                    <button class="btn btn-outline-warning btn-lg add-to-favorites-details"
                        data-product-id="${game.id}"
                        data-product-name="${game.name}"
                        data-product-price="${((game.id % 100) + 50).toFixed(2)}"
                        data-product-image="${game.background_image || '../img/placeholder.jpg'}">
                        <i class="bi ${isFavorited ? 'bi-heart-fill' : 'bi-heart'}"></i>
                    </button>
                </div>
            </div>
        </div>
      </div>`;
}

// Função para configurar os listeners dos botões "Comprar" e "Favoritar" na página de detalhes
function setupGameDetailsListeners(game, carrinhoManager, favoritosManager) {
    // Usamos classes específicas para os botões da página de detalhes para evitar conflitos
    const buyButton = document.querySelector('.add-to-cart-details');

    if (buyButton) {
        buyButton.addEventListener('click', (event) => {
            event.preventDefault();

            const produto = {
                id: game.id,
                name: game.name,
                price: parseFloat(((game.id % 100) + 50).toFixed(2)),
                image: game.background_image || '../img/placeholder.jpg'
            };

            carrinhoManager.adicionarItem(produto);
            showToast(`"${produto.name}" adicionado ao carrinho!`, 'success');

            const offcanvasCarrinho = new bootstrap.Offcanvas(document.getElementById('offcanvasCarrinho'));
            offcanvasCarrinho.show();
        });
    }

    const favoriteButton = document.querySelector('.add-to-favorites-details');
    if (favoriteButton) {
        // Não precisamos inicializar o estado do ícone aqui, pois já foi feito em renderGameDetails.
        // Apenas pegamos a referência do ícone.
        const icon = favoriteButton.querySelector('i.bi');

        favoriteButton.addEventListener('click', (event) => {
            event.preventDefault();

            const produto = {
                id: game.id,
                name: game.name,
                price: parseFloat(((game.id % 100) + 50).toFixed(2)),
                image: game.background_image || '../img/placeholder.jpg'
            };
            // CORRIGIDO: Nome do método 'adicionarRemoverItem'
            const isNowFavorited = favoritosManager.adicionarRemoverItem(produto);

            if (icon) {
                icon.classList.toggle('bi-heart-fill', isNowFavorited);
                icon.classList.toggle('bi-heart', !isNowFavorited);
            }
            showToast(`"${produto.name}" ${isNowFavorited ? 'adicionado' : 'removido'} dos favoritos!`, 'info'); // Texto do toast ajustado
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('TRACE: detalhes.js carregado. DOMContentLoaded.');

    // --- Inicializa Gerenciadores ---
    const carrinho = new CarrinhoManager();
    const favoritos = new FavoritosManager();


    // Obter o ID do jogo da URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    if (!gameId) {
        console.error('ERRO: ID do jogo não encontrado na URL.');
        showToast('ERRO: ID do jogo não especificado. Volte para a página inicial e tente novamente.', 'danger'); // <-- CORRIGIDO: Texto de erro

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }

    console.log(`TRACE: ID do jogo obtido da URL: ${gameId}`);

    // Buscar detalhes do jogo na API RAWG
    try {
        const gamedetails = await fetchGameById(gameId);
        console.log('TRACE: Detalhes do jogo recebidos:', gamedetails);

        // Renderizar os detalhes do jogo na página
        // CORRIGIDO: Passando a instância 'favoritos' para renderGameDetails
        renderGameDetails(gamedetails, favoritos);
        showToast(`Detalhes de "${gamedetails.name}" carregados!`, 'success');

        // Configurar os listeners dos botões de detalhes
        setupGameDetailsListeners(gamedetails, carrinho, favoritos);

    } catch (error) {
        console.error('ERRO ao buscar detalhes do jogo:', error);
        showToast('ERRO: Não foi possível carregar os detalhes do jogo.', 'danger');
    }

    // --- Event Listeners Globais (para offcanvas da navbar e botão Voltar ao Topo) ---
    // Note: A delegação de eventos para botões de carrinho/favoritos genéricos (.add-to-cart, .add-to-favorites)
    // na `document.body` só é realmente necessária na `index.js` (onde os cards são dinâmicos).
    // Na `detalhes.js`, os botões são específicos (.add-to-cart-details, .add-to-favorites-details)
    // e são tratados pela `setupGameDetailsListeners`.
    // Os listeners abaixo são para os botões do offcanvas em si.

    // Botão "Limpar Carrinho"
    const btnLimparCarrinho = document.getElementById('btn-limpar-carrinho');
    if (btnLimparCarrinho) {
        btnLimparCarrinho.addEventListener('click', () => {
            carrinho.limparCarrinho();
        });
    }

    // Botão "Limpar Favoritos"
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
});