// --- Importações de classes e utilitários ---
import { CarrinhoManager } from './classes/CarrinhoManager.js';
import { AuthManager } from './classes/AuthManager.js';
import { FavoritosManager } from './classes/FavoritosManager.js';
import { handleScrollToTopButton, showToast } from './utils/domUtils.js';
import { fetchGames, fetchGameTrailers } from './services/rawgApi.js';
import { scrollToTop } from './utils/helpers.js';


// --- FUNÇÕES DE RENDERIZAÇÃO ---

// Função para renderizar jogos em uma seção específica
async function renderGamesToSection(games, containerSelector, carrinhoManager, favoritosManager) { // Parâmetros corrigidos
    console.log('TRACE: renderGamesToSection', games, containerSelector);
    console.log('TRACE: Jogos recebidos para renderizar:', games);

    const container = document.querySelector(containerSelector);
    if (!container) {
        console.warn(`Container com ID "${containerSelector}" não encontrado.`);
        return;
    }
    console.log('TRACE: Container encontrado:', container);

    container.innerHTML = ''; // Limpa o conteúdo atual da seção

    if (!games || games.length === 0) {
        console.warn('Nenhum jogo encontrado para renderizar.');
        container.innerHTML = '<p class="text-center text-muted">Nenhum jogo encontrado.</p>';
        return;
    }

    // Renderiza cada jogo na seção
    games.forEach(game => {
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
                    <img src="${game.background_image || 'img/placeholder.jpg'}" class="card-img-top" alt="${game.name || 'nome do jogo'}">
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
                        data-product-image="${game.background_image || 'img/placeholder.jpg'}">
                        Comprar
                    </a>
                    <button class="btn btn-outline-warning add-to-favorites"
                        data-product-id="${game.id}"
                        data-product-name="${game.name}"
                        data-product-price="${((game.id % 100) + 50).toFixed(2)}"
                        data-product-image="${game.background_image || 'img/placeholder.jpg'}">
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


// NOVA FUNÇÃO: Renderiza os trailers no carrossel
async function renderTrailersCarousel() {
    const carouselInner = document.querySelector('#gameTrailersCarousel .carousel-inner');
    const carouselIndicators = document.querySelector('#gameTrailersCarousel .carousel-indicators');

    if (!carouselInner || !carouselIndicators) {
        console.warn('Elementos do carrossel não encontrados.');
        return;
    }

    const featuredGameId = 3498; // Ex: Grand Theft Auto V.

    try {
        const trailers = await fetchGameTrailers(featuredGameId);

        if (trailers && trailers.length > 0) {
            carouselInner.innerHTML = '';
            carouselIndicators.innerHTML = '';

            trailers.forEach((trailer, index) => {
                const videoUrl = trailer.data.max || trailer.data['480'];
                const previewImageUrl = trailer.preview;
                if (videoUrl) {
                    const activeClass = index === 0 ? 'active' : '';

                    carouselInner.innerHTML += `
                        <div class="carousel-item ${activeClass}">
                            <div class="embed-responsive embed-responsive-16by9 d-flex justify-content-center">
                                <video class="embed-responsive-item" controls muted playsinline preload="metadata"
                                    poster="${previewImageUrl || 'img/placeholder.jpg'}">
                                    <source src="${videoUrl}" type="video/mp4">
                                    Seu navegador não suporta a tag de vídeo.
                                </video>
                            </div>
                            <div class="carousel-caption d-none d-md-block">
                                <h5>${trailer.name || 'Trailer do Jogo'}</h5>
                            </div>
                        </div>
                    `;

                    carouselIndicators.innerHTML += `
                        <button type="button" data-bs-target="#gameTrailersCarousel" data-bs-slide-to="${index}" class="${activeClass}" aria-label="Slide ${index + 1}"></button>
                    `;
                }
            });
        } else {
            console.log('Nenhum trailer encontrado para o jogo.');
            const carouselContainer = document.getElementById('gameTrailersCarousel');
            if (carouselContainer) {
                carouselContainer.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Erro ao renderizar carrossel de trailers:', error);
        const carouselContainer = document.getElementById('gameTrailersCarousel');
        if (carouselContainer) {
            carouselContainer.style.display = 'none';
        }
    }
}

// --- Carrega e renderiza os jogos Mais Bem Avaliados e Novidades ---
async function loadAndRenderGames(carrinhoInstance, favoritosInstance) { // Recebe as instâncias
    try {
        // Chamada para jogos Mais Bem Avaliados (Ranking)
        const ratedGames = await fetchGames({ page_size: 15, ordering: '-rating' });
        renderGamesToSection(ratedGames, '#ranking-games-container', carrinhoInstance, favoritosInstance); // Passa instâncias

        // Chamada para Novidades (Jogos mais recentes)
        console.log('TRACE: Buscando novidades...');
        const newGames = await fetchGames({ page_size: 3, ordering: '-released' });
        console.log('TRACE: Novidades recebidas:', newGames);

        console.log('TRACE: Renderizando para #novidades-games-container...');
        renderGamesToSection(newGames, '#novidades-games-container', carrinhoInstance, favoritosInstance); // Passa instâncias
        console.log('TRACE: Renderização de #novidades-games-container concluída.');

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


    // Carrega e renderiza o carrossel de trailers
    await renderTrailersCarousel();

    // Carrega e renderiza os jogos das seções principais
    await loadAndRenderGames(carrinho, favoritos);

    // --- Delegação de Eventos ---

    document.body.addEventListener('click', (event) => {
        const target = event.target; // O elemento DOM que foi clicado

        // Lógica para o botão 'Comprar' (add-to-cart)
        // Usa 'closet' para garantir que mesmo um clique no ícone dentro do botão funcione
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
            event.preventDefault();  link
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