/**
 * @file BuscaManager.js
 * @description Gerencia as funcionalidades de busca, filtragem e exibição de jogos
 * utilizando a API RAWG. Inclui lógica para paginação e integração com
 * os gerenciadores de carrinho e favoritos.
 * @version 1.0.0
 */

import { fetchGames, fetchGenres, fetchPlatforms } from '../services/rawgApi.js';
import { showToast } from '../utils/domUtils.js';
import { CarrinhoManager } from './CarrinhoManager.js';
import { FavoritosManager } from './FavoritosManager.js';

/**
 * @typedef {object} Game - Representa um objeto de jogo da API RAWG.
 * @property {number} id - O ID único do jogo.
 * @property {string} name - O nome do jogo.
 * @property {string} [background_image] - URL da imagem de fundo do jogo.
 * @property {string} [released] - Data de lançamento do jogo.
 * @property {number} [rating] - Avaliação do jogo (0-5).
 */

/**
 * Gerencia as funcionalidades de busca, filtragem e exibição de jogos,
 * incluindo a interação com a API RAWG, paginação, carrinho e favoritos.
 */
export class SearchManager {
    /**
     * Cria uma instância do SearchManager.
     * @param {CarrinhoManager} carrinhoManager - Instância do gerenciador de carrinho.
     * @param {FavoritosManager} favoritosManager - Instância do gerenciador de favoritos.
     */
    constructor(carrinhoManager, favoritosManager) {
        /** @private @type {HTMLInputElement} Elemento do input de busca. */
        this.searchInput = document.getElementById('searchInput');
        /** @private @type {HTMLButtonElement} Elemento do botão de busca. */
        this.searchButton = document.getElementById('searchButton');
        /** @private @type {HTMLElement} Contêiner onde os resultados dos jogos são exibidos. */
        this.gameResultsContainer = document.getElementById('games-container');
        /** @private @type {HTMLElement} Elemento de spinner de carregamento. */
        this.loadingSpinner = document.getElementById('loading-spinner');
        /** @private @type {HTMLElement} Elemento da mensagem de "nenhum resultado encontrado". */
        this.noResultsMessage = document.getElementById('no-results-message');

        /** @private @type {HTMLButtonElement} Botão para filtrar por todos os jogos (filtro rápido). */
        this.filterAllGamesButton = document.getElementById('filterAllGames');
        /** @private @type {HTMLButtonElement} Botão para filtrar por novos lançamentos (filtro rápido). */
        this.filterNewReleasesButton = document.getElementById('filterNewReleases');
        /** @private @type {HTMLButtonElement} Botão para filtrar por jogos mais populares (filtro rápido). */
        this.filterPopularGamesButton = document.getElementById('filterPopularGames');

        /** @private @type {HTMLElement} Contêiner para os checkboxes de gênero no modal. */
        this.genresFilterContainer = document.getElementById('genresFilterContainer');
        /** @private @type {HTMLElement} Contêiner para os checkboxes de plataforma no modal. */
        this.platformsFilterContainer = document.getElementById('platformsFilterContainer');
        /** @private @type {HTMLButtonElement} Botão para limpar todos os filtros no modal. */
        this.clearFiltersButton = document.getElementById('clearFiltersButton');
        /** @private @type {HTMLButtonElement} Botão para aplicar os filtros no modal. */
        this.applyFiltersButton = document.getElementById('applyFiltersButton');

        /** @private @type {CarrinhoManager} Gerenciador de carrinho. */
        this.carrinhoManager = carrinhoManager;
        /** @private @type {FavoritosManager} Gerenciador de favoritos. */
        this.favoritosManager = favoritosManager;

        /** @private @type {HTMLElement} Contêiner dos controles de paginação. */
        this.paginationControls = document.getElementById('pagination-controls');

        // Estado da Paginação
        /** @private @type {number} A página atual da busca. */
        this.currentPage = 1;
        /** @private @type {string|null} URL da próxima página da API. */
        this.nextPageUrl = null;
        /** @private @type {string|null} URL da página anterior da API. */
        this.previousPageUrl = null;
        /** @private @type {number} Contagem total de resultados da busca. */
        this.totalResultsCount = 0;

        // Estado dos parâmetros de busca
        /** @private @type {Object.<string, any>} Parâmetros atuais para a requisição da API. */
        this.currentSearchParams = {
            search: '',
            genres: '',
            platforms: '',
            ordering: '-rating', // Define um filtro padrão para a carga inicial (Populares)
            page_size: 21,
            page: this.currentPage
        };

        // Estado dos filtros selecionados nos checkboxes do modal
        /** @private @type {string[]} Gêneros selecionados no filtro do modal (slugs). */
        this.selectedGenres = [];
        /** @private @type {string[]} Plataformas selecionadas no filtro do modal (slugs). */
        this.selectedPlatforms = [];
        /** @private @type {string|null} O filtro rápido de ordenação atualmente ativo. */
        this.currentQuickOrdering = null; 

        this.initEventListeners();
        this.populateFilters(); // Popula os checkboxes de gênero e plataforma

        // Oculta a mensagem de "nenhum resultado" na carga inicial
        this.hideNoResultsMessage();
        this.initialLoad(); // Carrega jogos iniciais ao carregar a página
    }

    /**
     * Inicializa todos os event listeners para os elementos da UI gerenciados por esta classe.
     * Os listeners para botões de "Adicionar ao Carrinho" e "Adicionar aos Favoritos"
     * nos cards de jogos são gerenciados por delegação de eventos no `main.js`.
     * @private
     */
    initEventListeners() {
        // Event listener para o input de busca (ao pressionar Enter)
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.currentPage = 1;
                    this.currentSearchParams.search = this.searchInput.value.trim();
                    // Ao fazer uma busca textual, limpamos outros filtros (rápidos e do modal)
                    this.selectedGenres = [];
                    this.selectedPlatforms = [];
                    this.currentQuickOrdering = null;
                    this._uncheckAllModalFilters(); // Desmarca checkboxes do modal
                    this._resetQuickFilterButtons(); // Desativa os botões de filtro rápido
                    this.performSearch();
                }
            });
        }

        // Event listener para o botão de busca
        if (this.searchButton) {
            this.searchButton.addEventListener('click', () => {
                this.currentPage = 1;
                this.currentSearchParams.search = this.searchInput.value.trim();
                // Ao fazer uma busca textual, limpamos outros filtros (rápidos e do modal)
                this.selectedGenres = [];
                this.selectedPlatforms = [];
                this.currentQuickOrdering = null;
                this._uncheckAllModalFilters(); // Desmarca checkboxes do modal
                this._resetQuickFilterButtons(); // Desativa os botões de filtro rápido
                this.performSearch();
            });
        }

        // Event listeners para os botões de filtro rápido
        if (this.filterAllGamesButton) {
            this.filterAllGamesButton.addEventListener('click', () => this.handleQuickFilter(null, this.filterAllGamesButton));
        }
        if (this.filterNewReleasesButton) {
            this.filterNewReleasesButton.addEventListener('click', () => this.handleQuickFilter('-added', this.filterNewReleasesButton));
        }
        if (this.filterPopularGamesButton) {
            this.filterPopularGamesButton.addEventListener('click', () => this.handleQuickFilter('-rating', this.filterPopularGamesButton));
        }

        // Event listener para o botão de limpar filtros no modal
        if (this.clearFiltersButton) {
            this.clearFiltersButton.addEventListener('click', () => this.clearFilters());
        }

        // Event listener para o botão de aplicar filtros no modal
        if (this.applyFiltersButton) {
            this.applyFiltersButton.addEventListener('click', () => this.applyModalFilters());
        }

        // Event listener para paginação (delegação)
        if (this.paginationControls) {
            this.paginationControls.addEventListener('click', (e) => {
                const target = e.target.closest('.page-link');
                if (target) {
                    e.preventDefault();
                    if (target.parentElement.classList.contains('disabled')) return;

                    if (target.getAttribute('aria-label') === 'Previous') {
                        if (this.previousPageUrl) {
                            this.currentPage--;
                            this.performSearch();
                        }
                    } else if (target.getAttribute('aria-label') === 'Next') {
                        if (this.nextPageUrl) {
                            this.currentPage++;
                            this.performSearch();
                        }
                    } else {
                        const pageNum = parseInt(target.textContent);
                        if (!isNaN(pageNum) && pageNum !== this.currentPage) {
                            this.currentPage = pageNum;
                            this.performSearch();
                        }
                    }
                }
            });
        }
    }

    /**
     * Lida com o clique nos botões de filtro rápido (Todos, Novidades, Populares).
     * @param {string|null} ordering - O valor do parâmetro 'ordering' para a API.
     * @param {HTMLElement} clickedButton - O botão HTML que foi clicado.
     * @private
     */
    handleQuickFilter(ordering, clickedButton) {
        this._resetQuickFilterButtons(); // Desativa todos os botões de filtro rápido
        clickedButton.classList.add('active'); // Ativa o botão clicado

        this.currentQuickOrdering = ordering;
        this.currentPage = 1;

        // Limpa o termo de busca e os filtros de modal ao usar um filtro rápido
        this.searchInput.value = '';
        this.selectedGenres = [];
        this.selectedPlatforms = [];
        this._uncheckAllModalFilters(); // Desmarca checkboxes do modal

        // Atualiza currentSearchParams com o novo ordenamento e limpa outros filtros
        this.currentSearchParams = {
            search: '', // Garante que a busca textual esteja limpa
            genres: '',
            platforms: '',
            page_size: 21,
            page: 1,
            ordering: ordering // Define o novo ordenamento
        };

        this.performSearch();
    }

    /**
     * Reseta a classe 'active' de todos os botões de filtro rápido.
     * @private
     */
    _resetQuickFilterButtons() {
        this.filterAllGamesButton.classList.remove('active');
        this.filterNewReleasesButton.classList.remove('active');
        this.filterPopularGamesButton.classList.remove('active');
    }

    /**
     * Desmarca todos os checkboxes de gênero e plataforma no modal.
     * @private
     */
    _uncheckAllModalFilters() {
        if (this.genresFilterContainer) {
            this.genresFilterContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        }
        if (this.platformsFilterContainer) {
            this.platformsFilterContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        }
    }

    /**
     * Aplica os filtros selecionados no modal de gênero e plataforma.
     */
    applyModalFilters() {
        this.selectedGenres = Array.from(this.genresFilterContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        this.selectedPlatforms = Array.from(this.platformsFilterContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);

        this.currentPage = 1;
        // Limpa o termo de busca e os filtros rápidos ao usar filtros do modal
        this.searchInput.value = '';
        this.currentQuickOrdering = null; // Reseta o filtro rápido
        this._resetQuickFilterButtons(); // Desativa os botões de filtro rápido

        // Atualiza currentSearchParams com os novos filtros.
        this.currentSearchParams = {
            search: '', // Garante que a busca textual esteja limpa
            page_size: 21,
            page: 1,
            genres: this.selectedGenres.join(','),
            platforms: this.selectedPlatforms.join(',')
        };

        // Se nenhum filtro de gênero/plataforma foi selecionado,
        // mas o filtro rápido "Todos" não está ativo (o que indica que talvez queiramos um padrão),
        // redefinimos para o padrão de ordenação popular.
        if (this.selectedGenres.length === 0 && this.selectedPlatforms.length === 0 && !this.currentQuickOrdering) {
            this.currentSearchParams.ordering = '-rating';
            this.filterPopularGamesButton.classList.add('active'); // Ativa Populares como padrão
        }

        this.performSearch();
    }


    /**
     * Limpa todos os filtros e a busca e executa uma nova busca com parâmetros padrão.
     */
    clearFilters() {
        this.currentPage = 1;
        this.searchInput.value = ''; // Limpa o input de busca
        this.selectedGenres = []; // Limpa gêneros selecionados
        this.selectedPlatforms = []; // Limpa plataformas selecionadas
        this.currentQuickOrdering = null; // Limpa filtro rápido

        this._uncheckAllModalFilters(); // Desmarca visualmente os checkboxes
        this._resetQuickFilterButtons(); // Reseta os botões de filtro rápido (desativa todos)
        this.filterAllGamesButton.classList.add('active'); // Ativa "Todos" após limpar

        this.currentSearchParams = { // Reseta para os parâmetros iniciais padrão
            search: '',
            genres: '',
            platforms: '',
            ordering: null, // Ao limpar, não há ordenação inicial ativa a menos que 'Todos' ative
            page_size: 21,
            page: this.currentPage
        };

        this.performSearch();
    }

    /**
     * Carrega jogos populares ao iniciar a página.
     * Define o estado inicial para exibir jogos populares por padrão.
     */
    async initialLoad() {
        // Assegura que o estado inicial dos filtros rápidos e modal esteja limpo
        this.searchInput.value = '';
        this.selectedGenres = [];
        this.selectedPlatforms = [];
        this._uncheckAllModalFilters();

        // Redefine todos os parâmetros para uma carga inicial limpa, focando em populares
        this.currentSearchParams = {
            search: '',
            genres: '',
            platforms: '',
            ordering: '-rating', // Carrega jogos mais populares por padrão
            page_size: 21,
            page: 1
        };
        this.currentPage = 1;
        this.currentQuickOrdering = '-rating'; // Sincroniza o estado interno para 'Populares'
        this._resetQuickFilterButtons();
        this.filterPopularGamesButton.classList.add('active'); // Ativa o botão "Populares" na carga inicial

        await this.performSearch();
    }

    /**
     * Popula os containers de checkboxes de gênero e plataforma com dados da API.
     * @private
     */
    async populateFilters() {
        // Carrega os gêneros
        if (this.genresFilterContainer) {
            try {
                const genres = await fetchGenres();
                this.genresFilterContainer.innerHTML = ''; // Limpa o "Carregando gêneros..."
                genres.forEach(genre => {
                    const div = document.createElement('div');
                    div.classList.add('list-group-item', 'bg-light');
                    div.innerHTML = `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${genre.slug}" id="genreCheck${genre.id}" data-type="genre">
                            <label class="form-check-label" for="genreCheck${genre.id}">
                                ${genre.name}
                            </label>
                        </div>
                    `;
                    this.genresFilterContainer.appendChild(div);
                });
            } catch (error) {
                console.error('Erro ao buscar gêneros:', error);
                showToast('Erro ao carregar opções de gênero.', 'danger');
                this.genresFilterContainer.innerHTML = '<p class="text-danger">Erro ao carregar gêneros.</p>';
            }
        }

        // Carrega as plataformas
        if (this.platformsFilterContainer) {
            try {
                const platforms = await fetchPlatforms();
                this.platformsFilterContainer.innerHTML = ''; // Limpa o "Carregando plataformas..."
                platforms.forEach(platform => {
                    const div = document.createElement('div');
                    div.classList.add('list-group-item', 'bg-light');
                    div.innerHTML = `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${platform.slug}" id="platformCheck${platform.id}" data-type="platform">
                            <label class="form-check-label" for="platformCheck${platform.id}">
                                ${platform.name}
                            </label>
                        </div>
                    `;
                    this.platformsFilterContainer.appendChild(div);
                });
            } catch (error) {
                console.error('Erro ao buscar plataformas:', error);
                showToast('Erro ao carregar opções de plataforma.', 'danger');
                this.platformsFilterContainer.innerHTML = '<p class="text-danger">Erro ao carregar plataformas.</p>';
            }
        }
    }

    /**
     * Executa a busca de jogos com base nos parâmetros atuais.
     * Gerencia estados de carregamento, exibição de resultados e mensagens de erro.
     */
    async performSearch() {
        this.showLoading();
        this.clearResults();
        this.hideNoResultsMessage(); // Esconde a mensagem antes de uma nova busca
        this.paginationControls.innerHTML = ''; // Limpa os controles de paginação antes de renderizar novos

        // Constrói os parâmetros finais para a API
        const params = {
            page_size: this.currentSearchParams.page_size,
            page: this.currentPage
        };

        if (this.currentSearchParams.search) {
            params.search = this.currentSearchParams.search;
            // Se houver busca textual, remove os filtros de gênero, plataforma e ordenação,
            // pois a busca textual na API RAWG geralmente ignora esses parâmetros.
            delete params.genres;
            delete params.platforms;
            delete params.ordering;
        } else {
            // Se não há busca textual, aplica os filtros de modal e ordenação rápida
            if (this.selectedGenres.length > 0) {
                params.genres = this.selectedGenres.join(',');
            }
            if (this.selectedPlatforms.length > 0) {
                params.platforms = this.selectedPlatforms.join(',');
            }
            if (this.currentQuickOrdering) {
                params.ordering = this.currentQuickOrdering;
            } else if (this.selectedGenres.length === 0 && this.selectedPlatforms.length === 0) {
                // Se não há busca textual, nem filtros de modal, nem ordenação rápida,
                // defina uma ordenação padrão para exibir algo.
                params.ordering = '-rating'; // Ex: Populares como padrão
                this.filterPopularGamesButton.classList.add('active'); // Garante que o botão 'Populares' esteja ativo
            }
        }

        console.log('Parâmetros enviados para a API:', params); // Para depuração

        try {
            const apiResponse = await fetchGames(params); // Usa os 'params' construídos
            const games = apiResponse.results;
            this.nextPageUrl = apiResponse.next;
            this.previousPageUrl = apiResponse.previous;
            this.totalResultsCount = apiResponse.count;

            if (games.length === 0) {
                this.showNoResultsMessage('Nenhum jogo encontrado com os critérios de busca.');
            } else {
                this.hideNoResultsMessage();
                this.renderGames(games);
                // CHAVE: Após renderizar os novos cards, atualize o estado de todos os botões de favoritos.
                this.favoritosManager.updateAllFavoriteButtonsUI(); 
            }
            this.renderPaginationControls(); // Renderiza paginação
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
     * Exibe o spinner de carregamento e oculta a mensagem de "nenhum resultado".
     * @private
     */
    showLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'block';
        }
        this.hideNoResultsMessage(); // Garante que a mensagem de no-results não apareça durante o carregamento
    }

    /**
     * Oculta o spinner de carregamento.
     * @private
     */
    hideLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'none';
        }
    }

    /**
     * Exibe a mensagem de "nenhum resultado encontrado".
     * @param {string} message - A mensagem a ser exibida.
     * @private
     */
    showNoResultsMessage(message) {
        if (this.noResultsMessage) {
            this.noResultsMessage.textContent = message;
            this.noResultsMessage.style.display = 'block';
        }
        if (this.gameResultsContainer) {
            this.gameResultsContainer.innerHTML = ''; // Limpa resultados existentes
        }
    }

    /**
     * Oculta a mensagem de "nenhum resultado encontrado".
     * @private
     */
    hideNoResultsMessage() {
        if (this.noResultsMessage) {
            this.noResultsMessage.style.display = 'none';
        }
    }

    /**
     * Limpa os resultados dos jogos da tela.
     * @private
     */
    clearResults() {
        if (this.gameResultsContainer) {
            this.gameResultsContainer.innerHTML = '';
        }
    }

    /**
     * Renderiza os controles de paginação (anterior, números de página, próximo).
     * @private
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

        nav.appendChild(ul);
        this.paginationControls.appendChild(nav);
    }

    /**
     * Renderiza os cards dos jogos no contêiner de resultados.
     * @param {Game[]} games - Uma array de objetos de jogos a serem renderizados.
     */
    renderGames(games) {
        if (!this.gameResultsContainer) return;

        // Limpa os resultados anteriores para exibir os novos
        this.gameResultsContainer.innerHTML = '';

        games.forEach(game => {
            const gameCard = this.createGameCard(game, this.favoritosManager);
            this.gameResultsContainer.appendChild(gameCard);
        });

        // NOTA: A anexação de listeners para "Adicionar ao Carrinho" e "Adicionar aos Favoritos"
        // é agora tratada pelo event listener delegado no `document.body` em `main.js`.
        // A função `attachCartAndWishListeners()` e os handlers diretos foram removidos.
    }

    /**
     * Cria e retorna um elemento de card HTML para um jogo.
     * @param {Game} game - O objeto do jogo com seus detalhes.
     * @param {FavoritosManager} favoritosManager - O gerenciador de favoritos para verificar o estado do favorito.
     * @returns {HTMLElement} O elemento DIV do card do jogo.
     */
    createGameCard(game, favoritosManager) {
        const stars = '⭐'.repeat(Math.round(game.rating || 0)); // Gera estrelas com base na avaliação
        const cardCol = document.createElement('div');
        // Mantém as classes da versão antiga para responsividade individual do card
        cardCol.classList.add('col-md-4', 'col-sm-6', 'mb-4');

        // Determina o estado inicial do ícone de favorito
        const isFavorited = favoritosManager.isFavorited(game.id);
        const heartIconClass = isFavorited ? 'bi-heart-fill' : 'bi-heart';

        cardCol.innerHTML = `
                <div class="card h-100 shadow-light game-card-link">
                    <a href="pages/detalhes.html?id=${game.id}" class="card-link-overlay">
                        <img src="${game.background_image || 'img/placeholder.PNG'}" class="card-img-top" alt="${game.name || 'Nome do jogo'}">
                        <div class="card-body text-center d-flex flex-column">
                            <h5 class="card-title fw-bold">${game.name || 'Nome Desconhecido'}</h5>
                            <p class="card-text flex-grow-1">
                                Lançamento: ${game.released || 'N/A'}<br>
                                Avaliação: <span>${game.rating?.toFixed(1) || 'N/A'}/5</span>
                            </p>
                            <p class="text-price text-success">R$${((game.id % 100) + 50).toFixed(2)}</p>
                            <p class="text-warning text-sm">
                                ${stars} (${game.rating?.toFixed(1) || 'N/A'}/5)
                            </p>
                        </div>
                        <div class="view-details-overlay">Ver Detalhes</div>
                    </a>
                    <div class="d-flex justify-content-around align-items-center mt-auto p-4 bg-light border-top">
                        <a class="btn btn-gamer add-to-cart flex-fill me-2"
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
                            <i class="bi ${heartIconClass}"></i>
                        </button>
                    </div>
                </div>
            `;
        return cardCol;
    }
}