/**
 * @file detalhes.js
 * @description Script responsável por carregar e exibir os detalhes de um jogo específico,
 * incluindo sua descrição, mídias (vídeo/screenshots), informações e jogos relacionados.
 * Gerencia interações de adição ao carrinho e aos favoritos na página de detalhes.
 * @version 1.0.0
 */

// --- IMPORTS ---
import { fetchGameDetails, fetchGameScreenshots, fetchGames } from './services/rawgApi.js';
import { showToast, handleScrollToTopButton } from './utils/domUtils.js';
import { CarrinhoManager } from './classes/CarrinhoManager.js';
import { FavoritosManager } from './classes/FavoritosManager.js';
import { scrollToTop } from './utils/helpers.js';

// --- Funções Auxiliares ---

/**
 * Cria um elemento HTML (card) para exibir um jogo relacionado.
 * Inclui informações básicas, preço simulado e botões de ação (carrinho/favoritos).
 *
 * @param {object} game - O objeto do jogo a ser exibido no card, contendo propriedades como `id`, `name`, `background_image`, `released`, `rating`.
 * @param {FavoritosManager} favoritosManagerInstance - Instância do `FavoritosManager` para verificar se o jogo já está favoritado.
 * @returns {HTMLDivElement} O elemento `div` que contém o card do jogo.
 */
function createGameCardForRelated(game, favoritosManagerInstance) {
    const placeholderImage = '../img/placeholder.PNG';
    const imageUrl = game.background_image || placeholderImage;
    const stars = '⭐'.repeat(Math.round(game.rating || 0));
    // Preço simulado baseado no ID do jogo
    const simulatedPrice = ((game.id % 100) + 50).toFixed(2);

    const cardCol = document.createElement('div');
    cardCol.classList.add('col-md-4', 'col-sm-6', 'mb-4');
    cardCol.innerHTML = `
        <div class="card h-100 shadow-light game-card-link">
            <a href="detalhes.html?id=${game.id}" class="card-link-overlay" aria-label="Ver detalhes de ${game.name || 'nome do jogo'}">
                <img src="${imageUrl}" class="card-img-top" alt="${game.name || 'nome do jogo'}">
                <div class="card-body text-center d-flex flex-column">
                    <h5 class="card-title fw-bold">${game.name || 'Nome Desconhecido'}</h5>
                    <p class="card-text flex-grow-1">
                        Lançamento: ${game.released || 'N/A'}<br>
                        Avaliação: <span>${game.rating || 'N/A'}/5</span>
                    </p>
                    <p class="text-price text-success">R$${simulatedPrice}</p>
                    <p class="text-warning text-sm">
                        ${stars}
                    </p>
                </div>
                <div class="view-details-overlay">Ver Detalhes</div>
            </a>
            <div class="d-flex justify-content-around align-items-center mt-auto p-3 bg-light border-top">
                <a href="#" class="btn btn-gamer flex-fill me-2 add-to-cart"
                    data-product-id="${game.id}"
                    data-product-name="${game.name}"
                    data-product-price="${simulatedPrice}"
                    data-product-image="${imageUrl}"
                    aria-label="Adicionar ${game.name} ao carrinho">
                    <i class="bi bi-cart-plus-fill me-2"></i>
                    Adicionar
                </a>
                <button class="btn btn-outline-warning add-to-favorites"
                    data-product-id="${game.id}"
                    data-product-name="${game.name}"
                    data-product-price="${simulatedPrice}"
                    data-product-image="${imageUrl}"
                    aria-label="${favoritosManagerInstance.isFavorited(game.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                    <i class="bi ${favoritosManagerInstance.isFavorited(game.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
                </button>
            </div>
        </div>
    `;
    return cardCol;
}

/**
 * Lida com o evento de clique para adicionar um produto ao carrinho.
 * Extrai os dados do produto dos `dataset` do elemento e os passa para o `CarrinhoManager`.
 * Exibe um toast de sucesso ou erro.
 *
 * @param {CarrinhoManager} carrinhoManager - Instância do `CarrinhoManager`.
 * @param {Event} event - O objeto do evento de clique.
 */
function handleAddToCart(carrinhoManager, event) {
    const { productId, productName, productPrice, productImage } = event.currentTarget.dataset;

    if (productId && productName && !isNaN(parseFloat(productPrice)) && productImage) {
        const product = { id: productId, name: productName, price: parseFloat(productPrice), image: productImage };
        carrinhoManager.adicionarItem(product);
        // O showToast já é chamado dentro do adicionarItem do CarrinhoManager,
        // então esta linha é redundante e pode ser removida para evitar dois toasts.
        // showToast(`"${product.name}" adicionado ao carrinho!`, 'success');
    } else {
        console.error('Dados do produto incompletos ou inválidos para adicionar ao carrinho:', event.currentTarget.dataset);
        showToast('Erro: Dados do produto inválidos para o carrinho.', 'danger');
    }
}

/**
 * Lida com o evento de clique para adicionar ou remover um produto da lista de favoritos.
 * Extrai os dados do produto dos `dataset` do elemento, atualiza o `FavoritosManager` e o ícone do coração.
 * Exibe um toast informativo.
 *
 * @param {FavoritosManager} favoritosManager - Instância do `FavoritosManager`.
 * @param {Event} event - O objeto do evento de clique.
 */
function handleAddToWishlist(favoritosManager, event) {
    const { productId, productName, productImage } = event.currentTarget.dataset;

    if (productId && productName && productImage) {
        const product = { id: productId, name: productName, image: productImage };
        // adicionarRemoverItem retorna true se foi adicionado, false se foi removido
        const isNowFavorited = favoritosManager.adicionarRemoverItem(product);

        const heartIcon = event.currentTarget.querySelector('i.bi');
        if (heartIcon) {
            heartIcon.classList.toggle('bi-heart-fill', isNowFavorited);
            heartIcon.classList.toggle('bi-heart', !isNowFavorited);
            // Atualiza o aria-label para acessibilidade
            event.currentTarget.setAttribute('aria-label', `${isNowFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} ${product.name}`);
        }
        // showToast já é chamado dentro do adicionarRemoverItem do FavoritosManager,
        // então esta linha é redundante e pode ser removida para evitar dois toasts.
        // showToast(`"${product.name}" ${isNowFavorited ? 'adicionado' : 'removido'} dos favoritos!`, 'info');
    } else {
        console.error('Dados do produto incompletos ou inválidos para adicionar/remover dos favoritos:', event.currentTarget.dataset);
        showToast('Erro: Dados do produto inválidos para favoritos.', 'danger');
    }
}

/**
 * Configura os event listeners para os botões de "Adicionar ao Carrinho" e "Adicionar aos Favoritos"
 * dentro de um contêiner HTML específico.
 *
 * @param {HTMLElement} container - O elemento HTML pai onde os botões estão localizados.
 * @param {CarrinhoManager} carrinhoManager - Instância do `CarrinhoManager`.
 * @param {FavoritosManager} favoritosManager - Instância do `FavoritosManager`.
 */
function setupListeners(container, carrinhoManager, favoritosManager) {
    // Escuta cliques em botões com as classes 'add-to-cart-details' (para o jogo principal)
    // e 'add-to-cart' (para jogos relacionados nos cards)
    container.querySelectorAll('.add-to-cart-details, .add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => handleAddToCart(carrinhoManager, event));
    });

    // Escuta cliques em botões com as classes 'add-to-favorites-details' (para o jogo principal)
    // e 'add-to-favorites' (para jogos relacionados nos cards)
    container.querySelectorAll('.add-to-favorites-details, .add-to-favorites').forEach(button => {
        button.addEventListener('click', (event) => handleAddToWishlist(favoritosManager, event));
    });
}

/**
 * Renderiza os detalhes completos de um jogo na página HTML.
 * Isso inclui a exibição de mídias (vídeo/imagem principal), screenshots,
 * informações detalhadas do jogo e botões de ação.
 *
 * @param {object} gameData - O objeto de detalhes do jogo, contendo dados da API RAWG,
 * incluindo um array `screenshots` populado.
 * @param {CarrinhoManager} carrinhoManager - Instância do `CarrinhoManager` para a funcionalidade do botão de compra.
 * @param {FavoritosManager} favoritosManager - Instância do `FavoritosManager` para a funcionalidade do botão de favoritos.
 */
function renderGameDetails(gameData, carrinhoManager, favoritosManager) {
    const detailsSection = document.getElementById('game-details-section');
    if (!detailsSection) {
        console.error('ERRO: Elemento #game-details-section não encontrado no HTML. Detalhes do jogo não podem ser renderizados.');
        return;
    }

    // Garante que `screenshots` é um array, mesmo que venha como `undefined` ou `null`
    const screenshots = Array.isArray(gameData.screenshots) ? gameData.screenshots : [];

    const isFavorited = favoritosManager.isFavorited(gameData.id);
    const stars = '⭐'.repeat(Math.round(gameData.rating || 0));
    // Preço simulado para o jogo principal
    const simulatedPrice = ((gameData.id % 100) + 50).toFixed(2);

    // Mídia principal (vídeo ou imagem de fundo)
    const mediaHTML = gameData.clip && gameData.clip.clip ? `
        <div class="game-media-container ratio ratio-16x9 mb-4 rounded shadow-lg overflow-hidden bg-dark">
            <video controls preload="metadata" poster="${gameData.background_image || '../img/placeholder.jpg'}" aria-label="Vídeo de gameplay de ${gameData.name}">
                <source src="${gameData.clip.clip}" type="video/mp4">
                Seu navegador não suporta a tag de vídeo.
            </video>
        </div>
    ` : `
        <div class="game-media-container mb-4 rounded shadow-lg overflow-hidden">
            <img src="${gameData.background_image || '../img/placeholder.jpg'}" class="img-fluid w-100" alt="Imagem principal de ${gameData.name}">
        </div>
    `;

    const hasScreenshots = screenshots.length > 0;

    // Galeria de screenshots (se houver)
    const screenshotsHTML = hasScreenshots ? `
        <div class="screenshots-gallery row g-2 mb-4">
            ${screenshots.slice(0, 4).map((screenshot, index) => `
                <div class="col-6 col-md-3">
                    <img src="${screenshot.image}" class="img-fluid rounded shadow-sm cursor-pointer" alt="Screenshot ${index + 1} de ${gameData.name}" data-bs-toggle="modal" data-bs-target="#screenshotModal" data-img-src="${screenshot.image}" role="button" tabindex="0" aria-label="Abrir screenshot ${index + 1} de ${gameData.name}">
                </div>
            `).join('')}
        </div>
        <button class="btn btn-outline-light d-block mx-auto mb-4" data-bs-toggle="modal" data-bs-target="#allScreenshotsModal" aria-label="Ver todas as imagens do jogo ${gameData.name}">Ver todas as imagens</button>
    ` : '';

    detailsSection.innerHTML = `
        <div class="container py-5 bg-dark text-white">
            <div class="row mb-4">
                <div class="col-12 text-center">
                    <h1 class="display-4 fw-bold mb-3">${gameData.name || 'Nome Desconhecido'}</h1>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-12 col-lg-8">
                    ${mediaHTML}
                </div>
            </div>

            ${screenshotsHTML}

            <div class="row">
                <div class="col-12 col-md-8 offset-md-2">
                    <p class="lead mb-4">${gameData.description_raw ? gameData.description_raw.substring(0, 1000) + (gameData.description_raw.length > 1000 ? '...' : '') : 'Sem descrição detalhada.'}</p>
                    <ul class="list-unstyled game-info-list mb-4">
                        <li><strong>Lançamento:</strong> ${gameData.released || 'N/A'}</li>
                        <li><strong>Avaliação:</strong> ${gameData.rating ? `${gameData.rating} / 5` : 'N/A'} (${stars})</li>
                        <li><strong>Gêneros:</strong> ${gameData.genres && gameData.genres.length > 0 ? gameData.genres.map(g => `<span class="badge bg-primary me-1 mb-1">${g.name}</span>`).join('') : 'N/A'}</li>
                        <li><strong>Plataformas:</strong> ${gameData.platforms && gameData.platforms.length > 0 ? gameData.platforms.map(p => `<span class="badge bg-secondary me-1 mb-1">${p.platform.name}</span>`).join('') : 'N/A'}</li>
                        <li><strong>Desenvolvedoras:</strong> ${gameData.developers && gameData.developers.length > 0 ? gameData.developers.map(d => d.name).join(', ') : 'N/A'}</li>
                        <li><strong>Publisher:</strong> ${gameData.publishers && gameData.publishers.length > 0 ? gameData.publishers.map(p => p.name).join(', ') : 'N/A'}</li>
                        <li><strong>Website:</strong> ${gameData.website ? `<a href="${gameData.website}" target="_blank" class="text-info">${gameData.website} <i class="bi bi-box-arrow-up-right"></i></a>` : 'N/A'}</li>
                    </ul>
                    <div class="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                        <button class="btn btn-gamer btn-lg flex-grow-1 add-to-cart-details"
                            data-product-id="${gameData.id}"
                            data-product-name="${gameData.name}"
                            data-product-price="${simulatedPrice}"
                            data-product-image="${gameData.background_image || '../img/placeholder.jpg'}"
                            aria-label="Comprar ${gameData.name} por R$${simulatedPrice}">
                            Comprar por R$${simulatedPrice}
                        </button>
                        <button class="btn btn-outline-warning btn-lg add-to-favorites-details"
                            data-product-id="${gameData.id}"
                            data-product-name="${gameData.name}"
                            data-product-price="${simulatedPrice}"
                            data-product-image="${gameData.background_image || '../img/placeholder.jpg'}"
                            aria-label="${isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} ${gameData.name}">
                            <i class="bi ${isFavorited ? 'bi-heart-fill' : 'bi-heart'}"></i> Adicionar aos Favoritos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Lógica para o modal de screenshot individual
    if (hasScreenshots) {
        detailsSection.querySelectorAll('.screenshots-gallery img').forEach(img => {
            img.addEventListener('click', (event) => {
                const modalImage = document.getElementById('screenshotModalImage');
                if (modalImage) {
                    modalImage.src = event.target.dataset.imgSrc;
                }
            });
        });

        // Lógica para popular o modal "Ver todas as imagens"
        const allScreenshotsModalBody = document.getElementById('allScreenshotsModalBody');
        if (allScreenshotsModalBody) {
            allScreenshotsModalBody.innerHTML = `
                <div class="row g-2">
                    ${screenshots.map(screenshot => `
                        <div class="col-6 col-md-4 col-lg-3">
                            <img src="${screenshot.image}" class="img-fluid rounded shadow-sm" alt="Screenshot do jogo">
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            console.warn('AVISO: Elemento #allScreenshotsModalBody não encontrado no DOM. O modal "Ver todas as imagens" pode não funcionar.');
        }
    }
}

// --- Inicialização da Página ---
document.addEventListener('DOMContentLoaded', async () => {
    // --- Inicializa Gerenciadores de Estado ---
    const carrinho = new CarrinhoManager();
    const favoritos = new FavoritosManager();

    // Obter o ID do jogo da URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    // Referências para elementos de UI de jogos relacionados
    const relatedGamesContainer = document.getElementById('related-games-container');
    const noRelatedGamesMessage = document.getElementById('no-related-games-message');
    const relatedGamesLoadingSpinner = document.getElementById('related-games-loading-spinner');

    if (!gameId) {
        console.error('ERRO: ID do jogo não encontrado na URL. Redirecionando...');
        showToast('ERRO: ID do jogo não especificado. Volte para a página inicial e tente novamente.', 'danger');
        setTimeout(() => { window.location.href = 'index.html'; }, 3000);
        return; // Sai da função se não houver ID
    }

    try {
        // --- Carregar e Renderizar Detalhes do Jogo Principal ---
        const gameDetails = await fetchGameDetails(gameId);
        // A busca por screenshots foi integrada na `fetchGameDetails` ou deve ser tratada como parte do `gameDetails` se a API retornar.
        // Se a API RAWG fornecer screenshots em um endpoint separado e for necessário,
        // a linha `gameDetails.screenshots = gameScreenshots;` estaria correta após um `await fetchGameScreenshots(gameId);`.
        // Mantive a estrutura do seu código original que faz duas chamadas e atribui, o que é válido.
        const gameScreenshots = await fetchGameScreenshots(gameId);
        gameDetails.screenshots = gameScreenshots; // Atribui as screenshots ao objeto gameDetails

        renderGameDetails(gameDetails, carrinho, favoritos);

        // Configurar listeners para os botões do jogo principal (que acabaram de ser renderizados)
        setupListeners(document.getElementById('game-details-section'), carrinho, favoritos); // Passa a seção de detalhes para focar os listeners

        // --- Carregar e Renderizar Jogos Relacionados ---
        relatedGamesLoadingSpinner.style.display = 'block'; // Mostra spinner de carregamento
        noRelatedGamesMessage.style.display = 'none'; // Esconde mensagem de "nenhum jogo"
        relatedGamesContainer.innerHTML = ''; // Limpa resultados anteriores

        if (!gameDetails || !gameDetails.genres || gameDetails.genres.length === 0) {
            noRelatedGamesMessage.style.display = 'block';
            noRelatedGamesMessage.querySelector('p').textContent = 'Nenhum gênero encontrado para este jogo, impossível buscar relacionados.';
            relatedGamesLoadingSpinner.style.display = 'none';
            return;
        }

        const genresSlugs = gameDetails.genres.map(genre => genre.slug).join(',');
        const relatedGamesParams = {
            genres: genresSlugs,
            page_size: 16,
            ordering: '-rating' // Ex: '-released' para mais recentes, ou '-rating' para melhores avaliados
        };

        const apiResponseForRelated = await fetchGames(relatedGamesParams);
        let relatedGames = apiResponseForRelated.results;

        // Filtra o jogo atualmente exibido para não aparecer nos "relacionados"
        relatedGames = relatedGames.filter(game => String(game.id) !== String(gameId));

        if (relatedGames.length === 0) {
            noRelatedGamesMessage.style.display = 'block';
            noRelatedGamesMessage.querySelector('p').textContent = 'Nenhum jogo relacionado encontrado.';
        } else {
            relatedGames.forEach(game => {
                const gameCard = createGameCardForRelated(game, favoritos);
                relatedGamesContainer.appendChild(gameCard);
            });
            // Configurar listeners para os botões dos jogos relacionados
            setupListeners(relatedGamesContainer, carrinho, favoritos);
        }

    } catch (error) {
        console.error('ERRO na lógica principal (detalhes ou relacionados):', error);
        showToast('Ocorreu um erro ao carregar os detalhes do jogo ou jogos relacionados.', 'danger');
        // Exibe uma mensagem de erro na seção de detalhes do jogo
        const detailsSection = document.getElementById('game-details-section');
        if (detailsSection) {
            detailsSection.innerHTML = '<p class="text-center text-white py-5">Não foi possível carregar os detalhes deste jogo. Tente novamente mais tarde.</p>';
        }
        // Exibe uma mensagem de erro para jogos relacionados
        if (noRelatedGamesMessage) {
            noRelatedGamesMessage.style.display = 'block';
            noRelatedGamesMessage.querySelector('p').textContent = 'Ocorreu um erro ao carregar jogos relacionados.';
        }
    } finally {
        // Garante que o spinner dos relacionados seja escondido no final
        if (relatedGamesLoadingSpinner) {
            relatedGamesLoadingSpinner.style.display = 'none';
        }
    }

    // --- Event Listeners Globais (para o offcanvas da navbar e o botão Voltar ao Topo) ---
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