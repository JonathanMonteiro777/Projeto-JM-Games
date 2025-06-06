// js/main.js

// Importações de classes e utilitários
import { CarrinhoManager } from './classes/CarrinhoManager.js';
import { AuthManager } from './classes/AuthManager.js';
import { FavoritosManager } from './classes/FavoritosManager.js';
import { handleScrollToTopButton, showToast } from './utils/domUtils.js';
import { fetchGames } from './services/rawgApi.js';
import { scrollToTop } from './utils/helpers.js';


// Inicialização de todas as funcionalidades quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {

    const carrinho = new CarrinhoManager(); // Inicializa o gerenciador de carrinho

    const auth = new AuthManager(); // Inicializa o gerenciador de autenticação (login/cadastro/logout)

    const favoritos = new FavoritosManager(); // Inicializa o gerenciador de favoritos

    function renderGamesToSection(games, containerSelector, CarrinhoManager, FavoritosManager) {
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

        

        games.forEach(game => {
            console.log(`TRACE: Processando jogo: ${game.name}, imagem: ${game.background_image}`);

            const stars = '⭐'.repeat(Math.round(game.rating || 0));
            const gameCard = `
        <div class="col-md-4 col-sm-6 mb-4">
            <div class="card h-100 shadow-light">
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
                    <div class="d-flex justify-content-around align-items-center mt-auto">
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
                            <i class="bi ${FavoritosManager.isFavorited(game.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
            container.insertAdjacentHTML('beforeend', gameCard);
        });

        reassignEventListeners(CarrinhoManager, FavoritosManager);
        console.log(`TRACE: renderGamesToSection finalizada para "${containerSelector}".`); 
    }

    // --- DEFINIÇÃO DA FUNÇÃO reassignEventListeners ---
    function reassignEventListeners(carrinhoManager, favoritosManager) {
        console.log('TRACE: reassignEventListeners chamada.');

        // Event listeners para adicionar ao carrinho
        document.querySelectorAll('.add-to-cart').forEach(button => {
            // Remove qualquer listener anterior para evitar duplicação (boa prática ao reatribuir)
            //button.removeEventListener('click', suaFuncaoAqui); // Se você usasse uma função nomeada
            button.onclick = (event) => { // Usando onclick simplifica a remoção de listeners anteriores
                event.preventDefault();

                const productId = button.dataset.productId;
                const productName = button.dataset.productName;
                const productPrice = parseFloat(button.dataset.productPrice);
                const productImage = button.dataset.productImage;

                const produto = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage
                };

                carrinhoManager.adicionarItem(produto); // Usar carrinhoManager
                showToast(`"${productName}" adicionado ao carrinho!`, 'success');
                const offcanvasCarrinho = new bootstrap.Offcanvas(document.getElementById('offcanvasCarrinho'));
                offcanvasCarrinho.show();
                console.log('TRACE: Botão "Comprar" clicado.');
            };
        });

        // Event listeners para adicionar/remover dos favoritos
        document.querySelectorAll('.add-to-favorites').forEach(button => {
            button.onclick = (event) => { // Usando onclick
                event.preventDefault(); // Boa prática para botões em links ou se o default é irrelevante

                const productId = button.dataset.productId;
                const productName = button.dataset.productName;
                const productPrice = parseFloat(button.dataset.productPrice);
                const productImage = button.dataset.productImage;

                const produto = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage
                };

                const isNowFavorited = favoritosManager.adicionarRemoverItem(produto); // Usar favoritosManager
                // Atualiza o ícone visualmente
                const icon = button.querySelector('i.bi');
                if (icon) {
                    icon.classList.toggle('bi-heart-fill', isNowFavorited);
                    icon.classList.toggle('bi-heart', !isNowFavorited);
                }
                showToast(`"${productName}" ${isNowFavorited ? 'adicionado' : 'removido'} dos favoritos!`, 'info');
                console.log('TRACE: Botão "Favoritar" clicado.');
            };
        });
        
        console.log('TRACE: reassignEventListeners finalizada.');
    }

    async function loadAndRenderGames() {
        try {
            //  chamada para jogos Mais Bem Avaliados (Ranking)
            const ratedGames = await fetchGames({ page_size: 5, ordering: '-rating' });
            renderGamesToSection(ratedGames, '#ranking-games-container', carrinho, favoritos);

            // chamada para Novidades (Jogos mais recentes)
            console.log('TRACE: Buscando novidades...');
            const newGames = await fetchGames({ page_size: 5, ordering: '-released' });
            console.log('TRACE: Novidades recebidas:', newGames);

            console.log('TRACE: Renderizando para #novidades-games-container...');
            renderGamesToSection(newGames, '#novidades-games-container', carrinho, favoritos);
            console.log('TRACE: Renderização de #novidades-games-container concluída.');

            showToast('Jogos carregados da API RAWG!', 'success');
        } catch (error) {
            showToast('Erro ao carregar jogos da API. Verifique sua conexão ou chave de API.', 'danger');
        }
    }

    loadAndRenderGames(); // Chama a função que iniciará a busca dos jogos

    // === Event Listeners Globais ===

    // 1. Botões "Comprar" para adicionar ao carrinho
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Evita que o link # mude a URL

            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = parseFloat(button.dataset.productPrice);
            const productImage = button.dataset.productImage;

            const produto = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            };

            carrinho.adicionarItem(produto);

            // Opcional: Abrir o offcanvas automaticamente após adicionar (se o botão estiver fora do offcanvas)
            const offcanvasCarrinho = new bootstrap.Offcanvas(document.getElementById('offcanvasCarrinho'));
            offcanvasCarrinho.show();
        });
    });

    // 2. Botão "Limpar Carrinho" dentro do offcanvas (se você tiver um)
    const btnLimparCarrinho = document.getElementById('btn-limpar-carrinho');
    if (btnLimparCarrinho) {
        btnLimparCarrinho.addEventListener('click', () => {
            carrinho.limparCarrinho();
        });
    }

    // 3. Botão "Voltar ao Topo"
    const btnVoltarTopo = document.getElementById('voltar-topo');
    if (btnVoltarTopo) {
        // Usa a função utilitária para controlar a visibilidade ao rolar
        window.addEventListener('scroll', handleScrollToTopButton);
        // Usa a função utilitária para rolar para o topo ao clicar
        btnVoltarTopo.addEventListener('click', scrollToTop);
    }

    // 4. Exemplo de uso do showToast (você pode chamar isso de dentro das suas classes também)
    showToast('Bem-vindo à JM Games!', 'info');

    // botões "Adicionar aos favoritos"
    document.querySelectorAll('.add-to-favorites').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const productId = button.dataset.productId;
            const productName = button.dataset.productName;
            const productPrice = parseFloat(button.dataset.productPrice);
            const productImage = button.dataset.productImage;

            const produto = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            };

            favoritos.adicionarRemoverItem(produto); // Alterna entre adicionar e remover do favoritos
        });
    });

    // Botão "Limpar favoritos" dentro do offcanvas
    const btnLimparFavoritos = document.getElementById('btn-limpar-favoritos');
    if (btnLimparFavoritos) {
        btnLimparFavoritos.addEventListener('click', () => {
            favoritos.limparFavoritos();
        });
    }
});