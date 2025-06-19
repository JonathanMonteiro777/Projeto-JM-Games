// js/pages/detalhes.js

// --- IMPORTS ---
import { fetchGameById, fetchGames } from './services/rawgApi.js';
import { showToast, handleScrollToTopButton } from './utils/domUtils.js';
import { CarrinhoManager } from './classes/CarrinhoManager.js';
import { AuthManager } from './classes/AuthManager.js';
import { FavoritosManager } from './classes/FavoritosManager.js';
import { scrollToTop } from './utils/helpers.js';

// --- Função reutilizável para criar um card de jogo (adaptada para esta página) ---
function createGameCardForRelated(game, favoritosManagerInstance) {
    const placeholderImage = '../img/placeholder.PNG';
    const imageUrl = game.background_image || placeholderImage;
    const stars = '⭐'.repeat(Math.round(game.rating || 0));

    const cardCol = document.createElement('div');
    cardCol.classList.add('col-md-4', 'col-sm-6', 'mb-4');
    cardCol.innerHTML = `
        <div class="card h-100 shadow-light game-card-link">
            <a href="detalhes.html?id=${game.id}" class="card-link-overlay">
                <img src="${imageUrl}" class="card-img-top" alt="${game.name || 'nome do jogo'}">
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
                    data-product-image="${imageUrl}">
                    <i class="bi bi-cart-plus-fill me-2"></i>
                    Adicionar
                </a>
                <button class="btn btn-outline-warning add-to-favorites"
                    data-product-id="${game.id}"
                    data-product-name="${game.name}"
                    data-product-price="${((game.id % 100) + 50).toFixed(2)}"
                    data-product-image="${imageUrl}">
                    <i class="bi ${favoritosManagerInstance.isFavorited(game.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
                </button>
            </div>
        </div>
    `;
    return cardCol;
}


// --- Funções de manipulação de carrinho/favoritos para os cards relacionados ---
function handleAddToCart(carrinhoManager, event) {
    const productId = event.currentTarget.dataset.productId;
    const productName = event.currentTarget.dataset.productName;
    const productPrice = parseFloat(event.currentTarget.dataset.productPrice);
    const productImage = event.currentTarget.dataset.productImage;

    if (productId && productName && !isNaN(productPrice) && productImage) {
        const product = { id: productId, name: productName, price: productPrice, image: productImage };
        carrinhoManager.adicionarItem(product);
        showToast(`"${product.name}" adicionado ao carrinho!`, 'success');
    } else {
        console.error('Dados do produto incompletos para adicionar ao carrinho:', event.currentTarget.dataset);
        showToast('Erro: Dados do produto inválidos para o carrinho.', 'danger');
    }
}

function handleAddToWishlist(favoritosManager, event) {
    const productId = event.currentTarget.dataset.productId;
    const productName = event.currentTarget.dataset.productName;
    const productImage = event.currentTarget.dataset.productImage;

    if (productId && productName && productImage) {
        const product = { id: productId, name: productName, image: productImage };
        const isNowFavorited = favoritosManager.adicionarRemoverItem(product);

        const heartIcon = event.currentTarget.querySelector('i.bi');
        if (heartIcon) {
            heartIcon.classList.toggle('bi-heart-fill', isNowFavorited);
            heartIcon.classList.toggle('bi-heart', !isNowFavorited);
        }
        showToast(`"${product.name}" ${isNowFavorited ? 'adicionado' : 'removido'} dos favoritos!`, 'info');
    } else {
        console.error('Dados do produto incompletos para adicionar à lista de desejos:', event.currentTarget.dataset);
        showToast('Erro: Dados do produto inválidos para favoritos.', 'danger');
    }
}

// Função para configurar os listeners dos botões "Comprar" e "Favoritar" na página de detalhes E NOS CARDS RELACIONADOS
function setupListeners(container, carrinhoManager, favoritosManager) {
    container.querySelectorAll('.add-to-cart-details, .add-to-cart').forEach(button => { // Inclui os do card principal e relacionados
        button.addEventListener('click', (event) => handleAddToCart(carrinhoManager, event));
    });

    container.querySelectorAll('.add-to-favorites-details, .add-to-favorites').forEach(button => { // Inclui os do card principal e relacionados
        button.addEventListener('click', (event) => handleAddToWishlist(favoritosManager, event));
        
    });
}


// --- Função para renderizar os detalhes do jogo principal ---
function renderGameDetails(game, favoritosManager) {
    const detailsSection = document.getElementById('game-details-section');
    if (!detailsSection) {
        console.error('ERRO: Seção de detalhes do jogo não encontrada no HTML.');
        return;
    }

    const isFavorited = favoritosManager.isFavorited(game.id);
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

// --- Lógica principal para carregar detalhes e relacionados ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('TRACE: detalhes.js carregado. DOMContentLoaded.');

    // --- Inicializa Gerenciadores ---
    const carrinho = new CarrinhoManager();
    const favoritos = new FavoritosManager();

    // Obter o ID do jogo da URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    const relatedGamesContainer = document.getElementById('related-games-container');
    const noRelatedGamesMessage = document.getElementById('no-related-games-message');
    const relatedGamesLoadingSpinner = document.getElementById('related-games-loading-spinner');


    if (!gameId) {
        console.error('ERRO: ID do jogo não encontrado na URL.');
        showToast('ERRO: ID do jogo não especificado. Volte para a página inicial e tente novamente.', 'danger');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        return; // Sai da função se não houver ID
    }

    console.log(`TRACE: ID do jogo obtido da URL: ${gameId}`);

    try {
        // Buscar detalhes do jogo principal
        const gameDetails = await fetchGameById(gameId);
        console.log('TRACE: Detalhes do jogo recebidos:', gameDetails);

        // Renderizar os detalhes do jogo na página
        renderGameDetails(gameDetails, favoritos);
        showToast(`Detalhes de "${gameDetails.name}" carregados!`, 'success');

        // Configurar os listeners para os botões do jogo principal
        // MUDANÇA AQUI: Passamos document para que a função pegue os botões da página inteira
        setupListeners(document, carrinho, favoritos);

        // ----- Lógica para Jogos Relacionados -----
        relatedGamesLoadingSpinner.style.display = 'block';
        noRelatedGamesMessage.style.display = 'none';
        relatedGamesContainer.innerHTML = ''; // Limpa resultados anteriores

        if (!gameDetails || !gameDetails.genres || gameDetails.genres.length === 0) {
            noRelatedGamesMessage.style.display = 'block';
            noRelatedGamesMessage.querySelector('p').textContent = 'Nenhum gênero encontrado para este jogo, impossível buscar relacionados.';
            relatedGamesLoadingSpinner.style.display = 'none'; // Esconde o spinner
            return; // Não prossegue se não houver gênero
        }

        const genresSlugs = gameDetails.genres.map(genre => genre.slug).join(',');

        // Buscar jogos relacionados
        const relatedGamesParams = {
            genres: genresSlugs,
            page_size: 16, // Quantos jogos relacionados mostrar
            ordering: '-rating' // Ou '-released' para mais recentes
        };
        const apiResponseForRelated = await fetchGames(relatedGamesParams);
        let relatedGames = apiResponseForRelated.results;

        // Filtrar manualmente o jogo atual dos resultados
        relatedGames = relatedGames.filter(game => String(game.id) !== String(gameId));

        if (relatedGames.length === 0) {
            noRelatedGamesMessage.style.display = 'block';
            noRelatedGamesMessage.querySelector('p').textContent = 'Nenhum jogo relacionado encontrado.';
        } else {
            relatedGames.forEach(game => {
                const gameCard = createGameCardForRelated(game, favoritos);
                relatedGamesContainer.appendChild(gameCard);
            });
            
            setupListeners(relatedGamesContainer, carrinho, favoritos);
        }

    } catch (error) {
        console.error('ERRO: Não foi possível carregar os detalhes do jogo ou jogos relacionados:', error);
        showToast('ERRO: Não foi possível carregar os detalhes do jogo ou jogos relacionados.', 'danger');
        document.getElementById('game-details-section').innerHTML = '<p class="text-center text-white">Não foi possível carregar os detalhes deste jogo.</p>';
        noRelatedGamesMessage.style.display = 'block';
        noRelatedGamesMessage.querySelector('p').textContent = 'Ocorreu um erro ao carregar jogos relacionados.';
    } finally {
        // Garante que o spinner dos relacionados seja escondido no final
        relatedGamesLoadingSpinner.style.display = 'none';
    }

    // --- Event Listeners Globais (para offcanvas da navbar e botão Voltar ao Topo) ---
    const btnLimparCarrinho = document.getElementById('btn-limpar-carrinho');
    if (btnLimparCarrinho) {
        btnLimparCarrinho.addEventListener('click', () => {
            carrinho.limparCarrinho();
        });
    }

    const btnLimparFavoritos = document.getElementById('btn-limpar-favoritos');
    if (btnLimparFavoritos) {
        btnLimparFavoritos.addEventListener('click', () => {
            favoritos.limparFavoritos();
        });
    }

    const btnVoltarTopo = document.getElementById('voltar-topo');
    if (btnVoltarTopo) {
        window.addEventListener('scroll', handleScrollToTopButton);
        btnVoltarTopo.addEventListener('click', scrollToTop);
    }
});