// js/pages/detalhes.js

// --- IMPORTS ---
import { fetchGameDetails, fetchGameScreenshots, fetchGames } from './services/rawgApi.js'; // Alterado para fetchGameDetails
import { showToast, handleScrollToTopButton } from './utils/domUtils.js';
import { CarrinhoManager } from './classes/CarrinhoManager.js';
import { AuthManager } from './classes/AuthManager.js'; // Importado mas não usado no snippet, manter se usar em outro lugar
import { FavoritosManager } from './classes/FavoritosManager.js';
import { scrollToTop } from './utils/helpers.js';

// --- Função reutilizável para criar um card de jogo relacionado ---
/**
 * Cria um elemento HTML (card) para exibir um jogo relacionado.
 * @param {Object} game - O objeto do jogo a ser exibido no card.
 * @param {FavoritosManager} favoritosManagerInstance - Instância do FavoritosManager para verificar se o jogo está favoritado.
 * @returns {HTMLDivElement} O elemento div que contém o card do jogo.
 */
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

// --- Funções de manipulação de carrinho/favoritos para os cards relacionados e principal ---
/**
 * Lida com o evento de clique para adicionar um produto ao carrinho.
 * Exibe um toast de sucesso ou erro.
 * @param {CarrinhoManager} carrinhoManager - Instância do CarrinhoManager.
 * @param {Event} event - O objeto do evento de clique.
 */
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

/**
 * Lida com o evento de clique para adicionar/remover um produto dos favoritos.
 * Atualiza o ícone do coração e exibe um toast informativo.
 * @param {FavoritosManager} favoritosManager - Instância do FavoritosManager.
 * @param {Event} event - O objeto do evento de clique.
 */
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

/**
 * Configura os event listeners para os botões "Comprar" e "Favoritar"
 * dentro de um contêiner HTML específico.
 * @param {HTMLElement} container - O elemento HTML onde os botões estão localizados.
 * @param {CarrinhoManager} carrinhoManager - Instância do CarrinhoManager.
 * @param {FavoritosManager} favoritosManager - Instância do FavoritosManager.
 */
function setupListeners(container, carrinhoManager, favoritosManager) {
    container.querySelectorAll('.add-to-cart-details, .add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => handleAddToCart(carrinhoManager, event));
    });

    container.querySelectorAll('.add-to-favorites-details, .add-to-favorites').forEach(button => {
        button.addEventListener('click', (event) => handleAddToWishlist(favoritosManager, event));
    });
}

// --- Função para renderizar os detalhes do jogo principal ---
/**
 * Renderiza os detalhes completos de um jogo na página, incluindo mídias (vídeo/imagem)
 * e informações detalhadas. Também configura a galeria de screenshots.
 * @param {Object} gameData - O objeto de detalhes do jogo retornado pela API RAWG.
 * @param {CarrinhoManager} carrinhoManager - Instância do CarrinhoManager para a funcionalidade do botão de compra.
 * @param {FavoritosManager} favoritosManager - Instância do FavoritosManager para a funcionalidade do botão de favoritos.
 */
function renderGameDetails(gameData, carrinhoManager, favoritosManager) {
    const detailsSection = document.getElementById('game-details-section');
    if (!detailsSection) {
        console.error('ERRO: Seção de detalhes do jogo não encontrada no HTML.');
        return;
    }

    console.log('TRACE: Iniciando renderGameDetails para o jogo:', gameData.name);

     // NOVO LOG CRÍTICO AQUI: Stringify o objeto completo para ver todas as propriedades
    console.log('TRACE: JSON completo de gameData DENTRO DE renderGameDetails:', JSON.stringify(gameData, null, 2)); 
    console.log('TRACE: Valor de gameData.screenshots DENTRO DE renderGameDetails:', gameData.screenshots); 

    // ESTE É O LOG MAIS IMPORTANTE AGORA! DEVE MOSTRAR UM ARRAY!
    console.log('TRACE: Valor de gameData.screenshots DENTRO DE renderGameDetails:', gameData.screenshots); 

    // *** GARANTIA DE QUE screenshots É UM ARRAY (AGORA REFERENCIANDO gameData.screenshots) ***
    const screenshots = Array.isArray(gameData.screenshots) ? gameData.screenshots : []; 
    console.log('TRACE: screenshots (após verificação de array):', screenshots);
    console.log('TRACE: screenshots.length (após verificação de array):', screenshots.length);


    const isFavorited = favoritosManager.isFavorited(gameData.id); 
    const stars = '⭐'.repeat(Math.round(gameData.rating || 0)); 

    // Mídia principal (vídeo ou imagem de fundo)
    const mediaHTML = gameData.clip && gameData.clip.clip ? `
        <div class="game-media-container ratio ratio-16x9 mb-4 rounded shadow-lg overflow-hidden bg-dark">
            <video controls preload="metadata" poster="${gameData.background_image || '../img/placeholder.jpg'}">
                <source src="${gameData.clip.clip}" type="video/mp4">
                Seu navegador não suporta a tag de vídeo.
            </video>
        </div>
    ` : `
        <div class="game-media-container mb-4 rounded shadow-lg overflow-hidden">
            <img src="${gameData.background_image || '../img/placeholder.jpg'}" class="img-fluid w-100" alt="${gameData.name}">
        </div>
    `;

    const hasScreenshots = screenshots.length > 0;

    // Galeria de screenshots (se houver)
    // ESTE LOG TAMBÉM DEVE SER TRUE AGORA PARA JOGOS COM SCREENSHOTS
    console.log('TRACE: gameData.screenshots existe e tem length > 0?', gameData.screenshots && gameData.screenshots.length > 0); 

    const screenshotsHTML = hasScreenshots ? `
        <div class="screenshots-gallery row g-2 mb-4">
            ${screenshots.slice(0, 4).map((screenshot, index) => `
                <div class="col-6 col-md-3">
                    <img src="${screenshot.image}" class="img-fluid rounded shadow-sm cursor-pointer" alt="Screenshot ${index + 1} de ${gameData.name}" data-bs-toggle="modal" data-bs-target="#screenshotModal" data-img-src="${screenshot.image}">
                </div>
            `).join('')}
        </div>
        <button class="btn btn-outline-light d-block mx-auto mb-4" data-bs-toggle="modal" data-bs-target="#allScreenshotsModal">Ver todas as imagens</button>
    ` : ''; // Se não houver screenshots, gera uma string vazia

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
                            data-product-price="${((gameData.id % 100) + 50).toFixed(2)}"
                            data-product-image="${gameData.background_image || '../img/placeholder.jpg'}">
                            Comprar por R$${((gameData.id % 100) + 50).toFixed(2)}
                        </button>
                        <button class="btn btn-outline-warning btn-lg add-to-favorites-details"
                            data-product-id="${gameData.id}"
                            data-product-name="${gameData.name}"
                            data-product-price="${((gameData.id % 100) + 50).toFixed(2)}"
                            data-product-image="${gameData.background_image || '../img/placeholder.jpg'}">
                            <i class="bi ${isFavorited ? 'bi-heart-fill' : 'bi-heart'}"></i> Adicionar aos Favoritos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Adiciona event listeners para abrir screenshots em modal (se houver galeria)
    if (hasScreenshots) {
        console.log('TRACE: Entrou no bloco de screenshots. Tentando popular o modal de todas as imagens.');
        detailsSection.querySelectorAll('.screenshots-gallery img').forEach(img => {
            img.addEventListener('click', (event) => {
                const modalImage = document.getElementById('screenshotModalImage');
                if (modalImage) {
                    modalImage.src = event.target.dataset.imgSrc;
                }
            });
        });
        // Lógica para o modal "Ver todas as imagens"
        const allScreenshotsModalBody = document.getElementById('allScreenshotsModalBody');
        if (allScreenshotsModalBody) {
             allScreenshotsModalBody.innerHTML = `
                <div class="row g-2">
                    ${screenshots.map(screenshot => `
                        <div class="col-6 col-md-4 col-lg-3">
                            <img src="${screenshot.image}" class="img-fluid rounded shadow-sm" alt="Screenshot">
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            console.warn('AVISO: allScreenshotsModalBody não encontrado no DOM. O modal de todas as imagens pode não funcionar.');
        }
    } else {
        console.log('TRACE: Não há screenshots no array processado. A galeria e o botão "Ver todas as imagens" não serão exibidos.');
    }
}

// --- Lógica principal para carregar detalhes e jogos relacionados ---
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
        // Buscar detalhes do jogo principal usando fetchGameDetails
        const gameDetails = await fetchGameDetails(gameId); // Usando a função mais específica
        console.log('DEBUG: Detalhes do jogo recebidos APÓS fetchGameDetails:', gameDetails);
        console.log('TRACE: Detalhes do jogo recebidos:', gameDetails);

        // Adicione esta chamada para buscar as screenshots separadamente
        const gameScreenshots = await fetchGameScreenshots(gameId);
        
        gameDetails.screenshots = gameScreenshots;

        // Renderizar os detalhes do jogo na página
        renderGameDetails(gameDetails, carrinho, favoritos); // Passando carrinho e favoritos

        // Configurar os listeners para os botões do jogo principal (e futuramente de outros elementos se necessário)
        setupListeners(document, carrinho, favoritos); // Passamos 'document' para abranger todos os botões recém-renderizados

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

        // Filtrar manualmente o jogo atual dos resultados para não mostrá-lo como relacionado
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
        console.error('ERRO: Não foi possível carregar os detalhes do jogo ou jogos relacionados:', error);
        showToast('ERRO: Não foi possível carregar os detalhes do jogo ou jogos relacionados.', 'danger');
        document.getElementById('game-details-section').innerHTML = '<p class="text-center text-white">Não foi possível carregar os detalhes deste jogo.</p>';
        noRelatedGamesMessage.style.display = 'block';
        noRelatedGamesMessage.querySelector('p').textContent = 'Ocorreu um erro ao carregar jogos relacionados.';
    } finally {
        // Garante que o spinner dos relacionados seja escondido no final, independentemente do resultado
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