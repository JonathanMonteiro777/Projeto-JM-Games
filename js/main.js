// js/main.js

// Importações de classes e utilitários
import { CarrinhoManager } from './classes/CarrinhoManager.js';
import { AuthManager } from './classes/AuthManager.js';
import { FavoritosManager } from './classes/FavoritosManager.js';
import { handleScrollToTopButton, showToast } from './utils/domUtils.js';
// import { fetchGames } from './services/rawgApi.js';
import { scrollToTop } from './utils/helpers.js';
// Importe outras classes como FavoritosManager, BuscaManager aqui quando criá-las

// Inicialização de todas as funcionalidades quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {

    const carrinho = new CarrinhoManager(); // Inicializa o gerenciador de carrinho

    const auth = new AuthManager(); // Inicializa o gerenciador de autenticação (login/cadastro/logout)

    const favoritos = new FavoritosManager(); // Inicializa o gerenciador de favoritos

    // async function loadAndRenderGames() {
    //     try {
    //         // Esta chamada agora usará a função fetchGames configurada para RapidAPI
    //         const games = await fetchGames({ page_size: 10, ordering: '-rating' });
    //         showToast('Jogos carregados da API RAWG!', 'success');
    //         renderGamesToSection(games, '#section-novidades');
    //     } catch (error) {
    //         showToast('Erro ao carregar jogos da API. Verifique sua conexão ou chave de API.', 'danger');
    //     }
    // }

    //  loadAndRenderGames(); // Chama a função que iniciará a busca dos jogos

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