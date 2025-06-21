import { fetchGames, fetchGenres, fetchPlatforms } from '../services/rawgApi.js';
import { showToast } from '../utils/domUtils.js';
import { CarrinhoManager } from './CarrinhoManager.js';
import { FavoritosManager } from './FavoritosManager.js';

/**
 * Gerencia as funcionalidades de busca, filtragem e exibição de jogos,
 * incluindo a interação com a API RAWG, paginação, carrinho e favoritos.
 */
export class SearchManager {
    /**
     * @param {CarrinhoManager} carrinhoManager - Instância do gerenciador de carrinho.
     * @param {FavoritosManager} favoritosManager - Instância do gerenciador de favoritos.
     */
    constructor(carrinhoManager, favoritosManager) {
        /** @type {HTMLInputElement} Elemento do input de busca. */
        this.searchInput = document.getElementById('search-input');
        /** @type {HTMLButtonElement} Elemento do botão de busca. */
        this.searchButton = document.getElementById('search-button');
        /** @type {HTMLElement} Contêiner onde os resultados dos jogos são exibidos. */
        this.gameResultsContainer = document.getElementById('game-results-container');
        /** @type {HTMLElement} Elemento de spinner de carregamento. */
        this.loadingSpinner = document.getElementById('loading-spinner');
        /** @type {HTMLElement} Elemento da mensagem de "nenhum resultado encontrado". */
        this.noResultsMessage = document.getElementById('no-results-message');

        // Elementos para filtros e botões de filtro
        /** @type {HTMLButtonElement} Botão para alternar a visibilidade dos filtros. */
        this.filterToggleButton = document.getElementById('filter-toggle-button');
        /** @type {HTMLElement} Contêiner colapsável dos filtros. */
        this.filtersCollapse = document.getElementById('filters-collapse');
        /** @type {HTMLSelectElement} Dropdown de filtro por gênero. */
        this.genreFilter = document.getElementById('genre-filter');
        /** @type {HTMLSelectElement} Dropdown de filtro por plataforma. */
        this.platformFilter = document.getElementById('platform-filter');
        /** @type {HTMLButtonElement} Botão para filtrar por novos lançamentos. */
        this.newReleasesBtn = document.getElementById('new-releases-btn');
        /** @type {HTMLButtonElement} Botão para filtrar por jogos mais populares. */
        this.mostPopularBtn = document.getElementById('most-popular-btn');
        /** @type {HTMLButtonElement} Botão para filtrar por jogos futuros. */
        this.upcomingBtn = document.getElementById('upcoming-btn');
        /** @type {HTMLButtonElement} Botão para limpar todos os filtros. */
        this.clearFiltersBtn = document.getElementById('clear-filters-btn');

        // Gerenciadores de carrinho e lista de desejos
        /** @type {CarrinhoManager} Gerenciador de carrinho. */
        this.carrinhoManager = carrinhoManager;
        /** @type {FavoritosManager} Gerenciador de favoritos. */
        this.favoritosManager = favoritosManager;

        // Elemento UI para Paginação
        /** @type {HTMLElement} Contêiner dos controles de paginação. */
        this.paginationControls = document.getElementById('pagination-controls');

        // Estado da Paginação
        /** @type {number} A página atual da busca. */
        this.currentPage = 1;
        /** @type {string|null} URL da próxima página da API. */
        this.nextPageUrl = null;
        /** @type {string|null} URL da página anterior da API. */
        this.previousPageUrl = null;
        /** @type {number} Contagem total de resultados da busca. */
        this.totalResultsCount = 0;

        // Estado dos parâmetros de busca
        /** @type {Object.<string, any>} Parâmetros atuais para a requisição da API. */
        this.currentSearchParams = {
            search: '',
            genres: '',
            platforms: '',
            page_size: 20, // Padrão de 20 resultados por página
            page: this.currentPage
        };

        this.initEventListeners();
        this.populateFilters(); // Popula os dropdowns de gênero e plataforma
        this.initialLoad(); // Carrega jogos iniciais ao carregar a página
    }

    /**
     * Inicializa todos os event listeners para os elementos da UI.
     */
    initEventListeners() {
        // Event listener para o input de busca (ao pressionar Enter)
        if (this.searchInput) {
            console.log('Search input found:', this.searchInput);
            this.searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    console.log('Enter pressed in search input');
                    // Resetar a página para 1 em uma nova busca
                    this.currentPage = 1;
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
                // Resetar a página para 1 em uma nova busca
                this.currentPage = 1;
                this.currentSearchParams.search = this.searchInput.value;
                this.performSearch();
            });
        }

        // Event listener para o filtro de gênero
        if (this.genreFilter) {
            this.genreFilter.addEventListener('change', () => {
                this.currentPage = 1; // Resetar a página ao mudar o filtro
                this.currentSearchParams.genres = this.genreFilter.value;
                this.performSearch();
            });
        }

        // Event listener para o filtro de plataforma
        if (this.platformFilter) { // Adicionado o event listener para o filtro de plataforma
            this.platformFilter.addEventListener('change', () => {
                this.currentPage = 1; // Resetar a página ao mudar o filtro
                this.currentSearchParams.platforms = this.platformFilter.value;
                this.performSearch();
            });
        }

        // Event listeners para os botões de navegação (Novos Lançamentos, Mais Populares, Em Breve)
        if (this.newReleasesBtn) {
            this.newReleasesBtn.addEventListener('click', (event) => this.handleNavigationButtonClick(event));
        }

        if (this.mostPopularBtn) {
            this.mostPopularBtn.addEventListener('click', (event) => this.handleNavigationButtonClick(event));
        }

        if (this.upcomingBtn) {
            this.upcomingBtn.addEventListener('click', (event) => this.handleNavigationButtonClick(event));
        }

        // Event listener para o botão de limpar filtros
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }
    }

    /**
     * Lida com o clique nos botões de navegação (Novos Lançamentos, Mais Populares, Em Breve).
     * @param {Event} event - O evento de clique.
     */
    handleNavigationButtonClick(event) {
        this.currentPage = 1; // Sempre resetar a página ao usar botões de navegação
        const type = event.target.dataset.filterType; // 'ordering' ou 'upcoming'
        const value = event.target.dataset.filterValue; // '-adde', 'rating' ou 'true'

        // Limpa todos os parâmetros de busca, exceto page_size, e adiciona o filtro específico
        this.currentSearchParams = { page_size: 20 }; // Manter page_size consistente
        this.currentSearchParams[type] = value;

        // Limpa o input de busca visualmente e remove o parâmetro 'search'
        if (this.searchInput) {
            this.searchInput.value = '';
            delete this.currentSearchParams.search;
        }

        // Reseta os dropdowns de filtro visualmente e remove os parâmetros correspondentes
        if (this.genreFilter) {
            this.genreFilter.value = '';
            delete this.currentSearchParams.genres;
        }
        if (this.platformFilter) {
            this.platformFilter.value = '';
            delete this.currentSearchParams.platforms;
        }

        this.performSearch();

        // Colapsa o menu de filtros após a seleção
        if (this.filtersCollapse && this.filtersCollapse.classList.contains('show')) {
            this.filtersCollapse.classList.remove('show');
        }
    }

    /**
     * Limpa todos os filtros e a busca e executa uma nova busca com parâmetros padrão.
     */
    clearFilters() {
        this.currentPage = 1; // Resetar a página ao limpar filtros
        this.currentSearchParams = { page_size: 20, ordering: '-rating' }; // Padrão de busca após limpar

        if (this.searchInput) this.searchInput.value = '';
        if (this.genreFilter) this.genreFilter.value = '';
        if (this.platformFilter) this.platformFilter.value = '';

        this.performSearch(); // Executa a busca com os filtros limpos

        // Colapsa o menu de filtros
        if (this.filtersCollapse && this.filtersCollapse.classList.contains('show')) {
            this.filtersCollapse.classList.remove('show');
        }
    }

    /**
     * Carrega jogos populares ao iniciar a página.
     * Originalmente exibia apenas uma mensagem, agora carrega conteúdo real.
     */
    async initialLoad() {
        this.currentSearchParams.search = ''; // Garante que a busca inicial não seja por um termo
        this.currentSearchParams.ordering = '-rating'; // Carrega jogos mais populares por padrão
        this.currentPage = 1; // Garante que a carga inicial comece na primeira página
        await this.performSearch();
    }

    /**
     * Popula os dropdowns de gênero e plataforma com dados da API.
     */
    async populateFilters() {
        // Carrega os gêneros
        if (this.genreFilter) {
            try {
                const genres = await fetchGenres();
                genres.forEach(genre => {
                    const option = document.createElement('option');
                    option.value = genre.slug;
                    option.textContent = genre.name;
                    this.genreFilter.appendChild(option);
                });
            } catch (error) {
                console.error('Erro ao buscar gêneros:', error);
                showToast('Erro ao carregar opções de gênero.', 'danger');
            }
        }

        // Carrega as plataformas
        if (this.platformFilter) {
            try {
                const platforms = await fetchPlatforms();
                platforms.forEach(platform => {
                    const option = document.createElement('option');
                    option.value = platform.slug;
                    option.textContent = platform.name;
                    this.platformFilter.appendChild(option);
                });
            } catch (error) {
                console.error('Erro ao buscar plataformas:', error);
                showToast('Erro ao carregar opções de plataforma.', 'danger');
            }
        }
    }

    /**
     * Executa a busca de jogos com base nos parâmetros atuais.
     * Gerencia estados de carregamento, exibição de resultados e mensagens de erro.
     */
    async performSearch() {
        console.log('performSearch chamado com os parâmetros:', this.currentSearchParams);

        // Limpa ordering/upcoming se houver um termo de busca
        if (this.currentSearchParams.search) {
            delete this.currentSearchParams.ordering;
            delete this.currentSearchParams.upcoming;
            // Limpa filtros de gênero e plataforma ao fazer uma busca textual
            delete this.currentSearchParams.genres;
            if (this.genreFilter) this.genreFilter.value = '';
            delete this.currentSearchParams.platforms;
            if (this.platformFilter) this.platformFilter.value = '';
        } else {
            // Se não houver termo de busca, garante que haja um parâmetro de ordenação padrão
            // para que o initialLoad ou filtros funcionem corretamente
            if (!this.currentSearchParams.ordering && !this.currentSearchParams.upcoming && !this.currentSearchParams.genres && !this.currentSearchParams.platforms) {
                this.currentSearchParams.ordering = '-rating'; // Padrão: mais populares
            }
        }

        // Garante que a página atual esteja nos parâmetros de busca
        this.currentSearchParams.page = this.currentPage;

        this.showLoading();
        this.clearResults();
        this.paginationControls.innerHTML = ''; // Limpa os controles de paginação antes de renderizar novos

        try {
            const apiResponse = await fetchGames(this.currentSearchParams);
            const games = apiResponse.results;
            this.nextPageUrl = apiResponse.next;
            this.previousPageUrl = apiResponse.previous;
            this.totalResultsCount = apiResponse.count;

            if (games.length === 0) {
                // Exibe mensagem de "nenhum resultado" se a API retornar vazio para a busca
                this.showNoResultsMessage('Nenhum jogo encontrado com os critérios de busca.');
            } else {
                this.hideNoResultsMessage();
                this.renderGames(games);
            }
            this.renderPaginationControls(); // Renderiza paginação mesmo sem resultados para mostrar '0 de X'
        } catch (error) {
            console.error('Erro ao buscar jogos:', error);
            showToast('Erro ao buscar jogos. Tente novamente mais tarde.', 'danger');
            this.showNoResultsMessage('Ocorreu um erro ao buscar os jogos. Por favor, tente novamente mais tarde.');
            this.paginationControls.innerHTML = ''; // Garante que a paginação não seja exibida em caso de erro
        } finally {
            this.hideLoading(); // Sempre esconde o spinner de carregamento
        }
    }

    /**
     * Renderiza os controles de paginação (anterior, números de página, próximo).
     */
    renderPaginationControls() {
        this.paginationControls.innerHTML = ''; // Limpa para re-renderizar

        // Se não há resultados ou apenas uma página, não renderiza controles de paginação
        if (this.totalResultsCount === 0 || (this.totalResultsCount <= this.currentSearchParams.page_size && this.currentPage === 1)) {
            return;
        }

        // Cria o contêiner da paginação para estilização Bootstrap
        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'Navegação de Página');
        const ul = document.createElement('ul');
        ul.classList.add('pagination', 'justify-content-center', 'mt-4'); // Classes Bootstrap para paginação

        // Botão "Anterior"
        const prevItem = document.createElement('li');
        prevItem.classList.add('page-item');
        if (!this.previousPageUrl) {
            prevItem.classList.add('disabled'); // Desabilita se não há página anterior
        }
        prevItem.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        ul.appendChild(prevItem);

        prevItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.previousPageUrl) {
                this.currentPage--;
                this.performSearch();
            }
        });

        const totalPages = Math.ceil(this.totalResultsCount / this.currentSearchParams.page_size);

        // Lógica para exibir um subconjunto de páginas (ex: 2 para trás, 2 para frente da página atual)
        const maxPagesToShow = 5; // Limite de páginas a serem exibidas
        let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Ajusta se estiver perto do final
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        // Adiciona reticências se a primeira página não for a 1
        if (startPage > 1) {
            const ellipsisStart = document.createElement('li');
            ellipsisStart.classList.add('page-item', 'disabled');
            ellipsisStart.innerHTML = `<span class="page-link">...</span>`;
            ul.appendChild(ellipsisStart);
        }

        // Números das páginas
        for (let i = startPage; i <= endPage; i++) {
            const pageNumItem = document.createElement('li');
            pageNumItem.classList.add('page-item');
            if (i === this.currentPage) {
                pageNumItem.classList.add('active'); // Marca a página atual como ativa
            }
            pageNumItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            ul.appendChild(pageNumItem);

            pageNumItem.addEventListener('click', (e) => {
                e.preventDefault();
                if (i !== this.currentPage) {
                    this.currentPage = i;
                    this.performSearch();
                }
            });
        }

        // Adiciona reticências se a última página não for a totalPages
        if (endPage < totalPages) {
            const ellipsisEnd = document.createElement('li');
            ellipsisEnd.classList.add('page-item', 'disabled');
            ellipsisEnd.innerHTML = `<span class="page-link">...</span>`;
            ul.appendChild(ellipsisEnd);
        }

        // Botão "Próximo"
        const nextItem = document.createElement('li');
        nextItem.classList.add('page-item');
        if (!this.nextPageUrl) {
            nextItem.classList.add('disabled'); // Desabilita se não há próxima página
        }
        nextItem.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        ul.appendChild(nextItem);

        nextItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.nextPageUrl) {
                this.currentPage++;
                this.performSearch(); // Re-executa a busca para a próxima página
            }
        });

        nav.appendChild(ul);
        this.paginationControls.appendChild(nav);
    }

    /**
     * Renderiza os cards dos jogos no contêiner de resultados.
     * @param {Array<Object>} games - Uma array de objetos de jogos a serem renderizados.
     */
    renderGames(games) {
        if (!this.gameResultsContainer) return;

        // Limpa os resultados anteriores para exibir os novos
        this.gameResultsContainer.innerHTML = '';

        games.forEach(game => {
            const gameCard = this.createGameCard(game, this.favoritosManager);
            this.gameResultsContainer.appendChild(gameCard);
        });

        // Re-anexa listeners para adicionar ao carrinho/favoritos nos novos cards renderizados
        this.attachCartAndWishListeners();
    }

    /**
     * Cria e retorna um elemento de card HTML para um jogo.
     * @param {Object} game - O objeto do jogo com seus detalhes.
     * @param {FavoritosManager} favoritosManager - O gerenciador de favoritos para verificar o estado do favorito.
     * @returns {HTMLElement} O elemento DIV do card do jogo.
     */
    createGameCard(game, favoritosManager) {
        const stars = '⭐'.repeat(Math.round(game.rating || 0)); // Gera estrelas com base na avaliação
        const cardCol = document.createElement('div');
        cardCol.classList.add('col-md-4', 'col-sm-6', 'mb-4');
        cardCol.innerHTML = `
                <div class="card h-100 shadow-light game-card-link">
                    <a href="pages/detalhes.html?id=${game.id}" class="card-link-overlay">
                        <img src="${game.background_image || 'img/placeholder.PNG'}" class="card-img-top" alt="${game.name || 'Nome do jogo'}">
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

    /**
     * Anexa os event listeners para os botões "Adicionar ao Carrinho" e "Adicionar aos Favoritos"
     * em todos os cards de jogos renderizados. Garante que listeners duplicados não sejam criados.
     */
    attachCartAndWishListeners() {
        // Seleciona todos os botões de "adicionar ao carrinho" nos resultados atuais
        this.gameResultsContainer.querySelectorAll('.add-to-cart').forEach(button => {
            // Remove o listener anterior para evitar duplicação em re-renderizações
            if (button.handleAddToCartBound) {
                button.removeEventListener('click', button.handleAddToCartBound);
            }
            // Anexa um novo listener e armazena a referência para futura remoção
            const boundHandler = this.handleAddToCart.bind(this, this.carrinhoManager);
            button.addEventListener('click', boundHandler);
            button.handleAddToCartBound = boundHandler;
        });

        // Seleciona todos os botões de "adicionar aos favoritos" nos resultados atuais
        this.gameResultsContainer.querySelectorAll('.add-to-favorites').forEach(button => {
            // Remove o listener anterior para evitar duplicação em re-renderizações
            if (button.handleAddToWishlistBound) {
                button.removeEventListener('click', button.handleAddToWishlistBound);
            }
            // Anexa um novo listener e armazena a referência para futura remoção
            const boundHandler = this.handleAddToWishlist.bind(this, this.favoritosManager);
            button.addEventListener('click', boundHandler);
            button.handleAddToWishlistBound = boundHandler;

            // Atualiza o ícone de favorito com base no estado atual
            const productId = button.dataset.productId;
            const heartIcon = button.querySelector('i.bi');
            if (heartIcon) {
                if (this.favoritosManager.isFavorited(productId)) {
                    heartIcon.classList.remove('bi-heart');
                    heartIcon.classList.add('bi-heart-fill');
                } else {
                    heartIcon.classList.remove('bi-heart-fill');
                    heartIcon.classList.add('bi-heart');
                }
            }
        });
    }

    /**
     * Lida com o evento de clique para adicionar um item ao carrinho.
     * @param {CarrinhoManager} carrinhoManager - Instância do gerenciador de carrinho.
     * @param {Event} event - O evento de clique.
     */
    handleAddToCart(carrinhoManager, event) {
        event.preventDefault(); // Evita a navegação do link <a>
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
            showToast('Erro: Dados do produto inválidos para o carrinho.', 'danger');
        }
    }

    /**
     * Lida com o evento de clique para adicionar/remover um item da lista de desejos (favoritos).
     * @param {FavoritosManager} favoritosManager - Instância do gerenciador de favoritos.
     * @param {Event} event - O evento de clique.
     */
    handleAddToWishlist(favoritosManager, event) {
        event.preventDefault(); // Evita o comportamento padrão do botão
        const productId = event.currentTarget.dataset.productId;
        const productName = event.currentTarget.dataset.productName;
        const productImage = event.currentTarget.dataset.productImage;

        if (productId && productName && productImage) {
            const product = {
                id: productId,
                name: productName,
                image: productImage
            };

            // Adiciona/remove o favorito e atualiza o ícone
            this.favoritosManager.adicionarFavorito(product); // Esta função já deve alternar o estado

            const heartIcon = event.currentTarget.querySelector('i.bi');
            if (heartIcon) {
                if (favoritosManager.isFavorited(productId)) {
                    heartIcon.classList.remove('bi-heart');
                    heartIcon.classList.add('bi-heart-fill');
                    showToast(`${productName} adicionado aos favoritos!`, 'success');
                } else {
                    heartIcon.classList.remove('bi-heart-fill');
                    heartIcon.classList.add('bi-heart');
                    showToast(`${productName} removido dos favoritos!`, 'info');
                }
            }
        } else {
            console.error('Dados do produto incompletos para adicionar/remover da lista de desejos:', event.currentTarget.dataset);
            showToast('Erro: Dados do produto inválidos para favoritos.', 'danger');
        }
    }

    /**
     * Limpa o contêiner de resultados de jogos.
     */
    clearResults() {
        if (this.gameResultsContainer) {
            this.gameResultsContainer.innerHTML = '';
        }
    }

    /**
     * Exibe o spinner de carregamento e esconde a mensagem de "nenhum resultado".
     */
    showLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'block';
        }
        if (this.noResultsMessage) {
            this.noResultsMessage.style.display = 'none';
        }
    }

    /**
     * Esconde o spinner de carregamento.
     */
    hideLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'none';
        }
    }

    /**
     * Exibe a mensagem de "nenhum resultado encontrado".
     * @param {string} [message='Nenhum resultado encontrado.'] - A mensagem a ser exibida.
     */
    showNoResultsMessage(message = 'Nenhum resultado encontrado.') {
        if (this.noResultsMessage) {
            this.noResultsMessage.textContent = message;
            this.noResultsMessage.style.display = 'block';
        }
    }

    /**
     * Esconde a mensagem de "nenhum resultado encontrado".
     */
    hideNoResultsMessage() {
        if (this.noResultsMessage) {
            this.noResultsMessage.style.display = 'none';
        }
    }
}