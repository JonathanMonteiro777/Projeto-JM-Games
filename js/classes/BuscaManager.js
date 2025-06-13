import { fetchGames, fetchGenres, fetchPlatforms } from '../services/rawgApi.js';
import { showToast } from '../utils/domUtils.js';
import { CarrinhoManager } from './CarrinhoManager.js';
import { FavoritosManager } from './FavoritosManager.js';


export class SearchManager {
    constructor(carrinhoManager, favoritosManager) {
        // Elementos da UI
         this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-button');
        this.gameResultsContainer = document.getElementById('game-results-container');
        this.loadingSpinner = document.getElementById('loading-spinner');
        this.noResultsMessage = document.getElementById('no-results-message');

        // Elementos para filtros e botões de filtro
        this.filterToggleButton = document.getElementById('filter-toggle-button');
        this.filtersCollapse = document.getElementById('filters-collapse');
        this.genreFilter = document.getElementById('genre-filter');
        this.platformFilter = document.getElementById('platform-filter');
        this.newReleasesBtn = document.getElementById('new-releases-btn');
        this.mostPopularBtn = document.getElementById('most-popular-btn');
        this.upcomingBtn = document.getElementById('upcoming-btn');
        this.clearFiltersBtn = document.getElementById('clear-filters-btn');

       // Gerenciadores de carrinho e lista de desejos
        this.carrinhoManager = carrinhoManager;
        this.favoritosManager = favoritosManager;


        // Estado da busca
        this.currentSearchParams = {
            search: '',
            genres: '',
            platforms: '',
            page_size: 20 // Quantos resultados por página
        };

        this.initEventListeners();
        this.populateFilters(); // Popula os dropdowns de gênero e plataforma
        this.initialLoad(); // Carrega alguns jogos ao iniciar a página
    }

    initEventListeners() {
        // Event listener para o input de busca
        if (this.searchInput) {
            console.log('Search input found:', this.searchInput);
            this.searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    console.log('Enter pressed in search input');
                    this.currentSearchParams.search = this.searchInput.value;
                    this.performSearch();
                }
            });
        }

        // Event listener para o botão de busca
        if (this.searchButton) {
            console.log('Search button found:', this.searchButton);
            this.searchButton.addEventListener('click', () => {
                console.log('Search button clicked');
                this.currentSearchParams.search = this.searchInput.value;
                this.performSearch();
            });
        }

        // Event listener para os filtros 
        if (this.genreFilter) {
            this.genreFilter.addEventListener('change', () => {
                this.currentSearchParams.genres = this.genreFilter.value;
                this.performSearch();
            });
        }

        // Event listener para os filtros
        if (this.newReleasesBtn) {
            this.newReleasesBtn.addEventListener('click', (event) => this.handleNavigationButtonClick(event));
        }
        
        if (this.mostPopularBtn) {
            this.mostPopularBtn.addEventListener('click', (event) => this.handleNavigationButtonClick(event));
        }

        if (this.upcomingBtn) {
            this.upcomingBtn.addEventListener('click', (event) => this.handleNavigationButtonClick(event));
        }
    }

    handleNavigationButtonClick(event) {
        const type = event.target.dataset.filterType; // 'ordering' ou 'upcoming'    
        const value = event.target.dataset.filterValue; // '-adde', 'rating' ou 'true'

        // Limpa os parâmetros de busca anteriores, exceto page_size
        this.currentSearchParams = { page_size: 9 };
        this.currentSearchParams[type] = value; // Adiciona o filtro clicado

        // Limpa o input de busca visualmente
        if (this.searchInput) {
            this.searchInput.value = '';
            delete this.currentSearchParams.search; // Garante que o search esteja limpo
        }

        // Reseta os dropdowns de filtro visualmente
        if (this.genreFilter) this.genreFilter.value = '';
        if (this.platformFilter) this.platformFilter.value = ''; 

        this.performSearch();

        // Colapsar o menu de filtros após a seleção
        if (this.filtersCollapse && this.filtersCollapse.classList.contains('show')) {
            this.filtersCollapse.classList.remove('show');
        }
    }

    // Limpa todos os filtros e a busca
    clearFilters() {
        this.currentSearchParams = { page_size: 10 };

        if (this.searchInput) this.searchInput.value = '';
        if (this.genreFilter) this.genreFilter.value = '';
        if (this.platformFilter) this.platformFilter.value = '';

        this.performSearch(); // Executa a busca com os filtros limpos

        // Colapsa o menu de filtros
        if (this.filtersCollapse && this.filtersCollapse.classList.contains('show')) {
            this.filtersCollapse.classList.remove('show');
        }
    }

    // Exibe a mensagem de carregamento
    async initialLoad() {
        
        this.hideLoading();
        this.clearResults();
        this.showNoResultsMessage('Use a barra de pesquisa para encontrar jogos!');
        this.populateFilters(); // Garante que os filtros sejam preenchidos ao carregar
    }

    async performSearch() {
        console.log('performSearch called!', this.currentSearchParams);

        // Remove ordering se houver um termo de busca
        if (this.currentSearchParams.search) {
            delete this.currentSearchParams.ordering;
            delete this.currentSearchParams.upcoming; // Remove upcoming se houver um termo de busca
        } else {
            // Se não houver um parâmetro de ordenação, define o padrão
            if (!this.currentSearchParams.ordering && !this.currentSearchParams.upcoming) {
                this.currentSearchParams.ordering = '-rating';
            }
        }

        this.showLoading();
        this.clearResults();

        try {
            const games = await fetchGames(this.currentSearchParams);
            this.renderGames(games);
            if (games.length === 0) {
                this.showNoResultsMessage('Nenhum jogo encontrado com os critérios de busca');
            } else {
                this.hideNoResultsMessage();
                this.renderGames(games);
            }
        } catch (error) {
            console.error('Error fetching games:', error);
            showToast('Erro ao buscar jogos. Tente novamente mais tarde.');
            this.showNoResultsMessage('Ocorreu um erro ao buscar os jogos. Tente novamente mais tarde.');
        } finally {
            this.hideLoading();
        }
    }

    renderGames(games) {
        if (!this.gameResultsContainer) return;

        // Limpa os resultados anteriores
        this.gameResultsContainer.innerHTML = '';

        games.forEach(game => {
            const gameCard = this.createGameCard(game, this.favoritosManager);
            this.gameResultsContainer.appendChild(gameCard);
        });

        // Re-anexa listeners para adicionar ao carrinho/favoritos nos novos cards
        this.attachCartAndWishListeners();
    }

    createGameCard(game, favoritosManager) {
        // Cria um elemento de card para o jogo
        const stars = '⭐'.repeat(Math.round(game.rating || 0));
        const cardCol = document.createElement('div');
        cardCol.classList.add('col-md-4', 'col-sm-6', 'mb-4');
        cardCol.innerHTML = `
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
        `;


        return cardCol;
    }

    // Esta função será chamada após renderizar novos jogos
    attachCartAndWishListeners() {

        const carrinhoManager = this.carrinhoManager;
        const favoritosManager = this.favoritosManager;

        this.gameResultsContainer.querySelectorAll('.add-to-cart').forEach(button => {
            // Remova o listener antigo para evitar duplicidade, se já existir
            button.removeEventListener('click', this.handleAddToCartBound); // Remova a referência bindada
            // Cria uma nova referência bindada e a armazena para poder remover depois
            const boundHandler = this.handleAddToCart.bind(this, this.carrinhoManager);
            button.addEventListener('click', boundHandler);
            button.handleAddToCartBound = boundHandler; // Armazena a referência para remoção futura
        });

        this.gameResultsContainer.querySelectorAll('.add-to-favorites').forEach(button => {
            button.removeEventListener('click', this.handleAddToWishlistBound); // Remova a referência bindada
            const boundHandler = this.handleAddToWishlist.bind(this, this.favoritosManager);
            button.addEventListener('click', boundHandler);
            button.handleAddToWishlistBound = boundHandler; // Armazena a referência para remoção futura

            // Atualiza o ícone de favorito
            const productId = button.dataset.productId; // Use data-product-id
            const heartIcon = button.querySelector('i.bi');
            if (heartIcon && this.favoritosManager.isFavorited(productId)) {
                heartIcon.classList.remove('bi-heart');
                heartIcon.classList.add('bi-heart-fill');
            } else if (heartIcon) {
                heartIcon.classList.remove('bi-heart-fill');
                heartIcon.classList.add('bi-heart');
            }
        });
    }

    // Handlers para adicionar jogos ao carrinho e lista de desejos
    handleAddToCart(carrinhoManager, event) {
        const productId = event.currentTarget.dataset.productId;
        const productName = event.currentTarget.dataset.productName;
        const productPrice = parseFloat(event.currentTarget.dataset.productPrice);
        const productImage = event.currentTarget.dataset.productImage;

        if (productId && productName && !isNaN(productPrice) && productImage) {
            const product = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            };

            carrinhoManager.adicionarItem(product);
        } else {
            console.error('Dados do produto incompletos para adicionar ao carrinho:', event.currentTarget.dataset);
            showToast('Erro: Dados do produto inválidos.', 'danger');
        }
    }

    handleAddToWishlist(favoritosManager, event) {
        const productId = event.currentTarget.dataset.productId;
        const productName = event.currentTarget.dataset.productName;
        const productImage = event.currentTarget.dataset.productImage;

        if (productId && productName && productImage) {
            const product = {
                id: productId,
                name: productName,
                image: productImage
            };

            this.favoritosManager.adicionarFavorito(product);

            const heartIcon = event.currentTarget.querySelector('i.bi');
            if (favoritosManager.isFavorited(productId)) {
                heartIcon.classList.remove('bi-heart');
                heartIcon.classList.add('bi-heart-fill');
            } else {
                heartIcon.classList.remove('bi-heart-fill');
                heartIcon.classList.add('bi-heart');
            }

        } else {
            console.error('Dados do produto incompletos para adicionar à lista de desejos:', event.currentTarget.dataset);
            showToast('Erro: Dados do produto inválidos.', 'danger');
        }
    }

    clearResults() {
        if (this.gameResultsContainer) {
            this.gameResultsContainer.innerHTML = '';
        }
    }

    showLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'block';
        }
        if (this.noResultsMessage) {
            this.noResultsMessage.style.display = 'none';
        }
    }

    hideLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'none';
        }
    }

    showNoResultsMessage(message = 'Nenhum resultado encontrado.') {
        if (this.noResultsMessage) {
            this.noResultsMessage.textContent = message;
            this.noResultsMessage.style.display = 'block';
        }
    }

    hideNoResultsMessage() {
        if (this.noResultsMessage) {
            this.noResultsMessage.style.display = 'none';
        }
    }
}