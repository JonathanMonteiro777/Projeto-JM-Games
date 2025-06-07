// Importar a função fetchGameById do arquivo rawgApi.js
// E showToast do arquivo domUtils.js
import { fetchGameById } from './services/rawgApi.js';
import { showToast } from './utils/domUtils.js';
import { CarrinhoManager } from './classes/CarrinhoManager.js'; 

document.addEventListener('DOMContentLoaded', async () => {
    console.log('TRACE: detalhes.js carregado. DOMContentLoaded.');

    // Obter o ID do jogo da URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    if (!gameId) {
        console.error('ERRO: ID do jogo não encontrado na URL.');
        showToast('ERRO: ID do jogo não especificado. Vle para a página inicial e tente novamente.', 'danger');

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
        renderGameDetails(gamedetails);
        showToast(`Detalhes de "${gamedetails.name}" carregados!`, 'success');

    } catch (error) {
        console.error('ERRO ao buscar detalhes do jogo:', error);
        showToast('ERRO: Não foi possível carregar os detalhes do jogo.', 'danger');
    }
});

// Função para renderizar os detalhes do jogo na página
function renderGameDetails(game) {
    const detailsSection = document.getElementById('game-details-section');
    if (!detailsSection) {
        console.error('ERRO: Seção de detalhes do jogo não encontrada no HTML.');
        return;
    }

    detailsSection.innerHTML = `
     <div class="container py-5 bg-dark text-white">
        <div class="row">
            <div class="col-md-5 mb-4">
                <img src="<span class="math-inline">\{game\.background\_image \|\| '\.\./img/placeholder\.jpg'\}" class\="img\-fluid rounded shadow\-lg" alt\="</span>{game.name}">
            </div>
            <div class="col-md-7 mb-4">
                <h1 class="display-4 fw-bold mb-3">${game.name || 'Nome Desconhecido'}</h1>
                <p class="lead">${game.description_raw ? game.description_raw.substring(0, 500) + '...' : 'Sem descrição.'}</p>
                <ul class="list-unstyled">
                    <li><strong>Lançamento:</strong> ${game.released || 'N/A'}</li>
                    <li><strong>Avaliação:</strong> ${game.rating || 'N/A'} / 5 (${'⭐'.repeat(Math.round(game.rating || 0))})</li>
                    <li><strong>Gêneros:</strong> ${game.genres && game.genres.length > 0 ? game.genres.map(g => g.name).join(', ') : 'N/A'}</li>
                    <li><strong>Plataformas:</strong> ${game.platforms && game.platforms.length > 0 ? game.platforms.map(p => p.platform.name).join(', ') : 'N/A'}</li>
                    <li><strong>Desenvolvedoras:</strong> ${game.developers && game.developers.length > 0 ? game.developers.map(d => d.name).join(', ') : 'N/A'}</li>
                    <li><strong>Website:</strong> ${game.website ? `<a href="<span class="math-inline">\{game\.website\}" target\="\_blank" class\="text\-info"\></span>{game.website}</a>` : 'N/A'}</li> </ul>
                <button class="btn btn-gamer btn-lg mt-3">Comprar por R$${((game.id % 100) + 50).toFixed(2)}</button>
            </div>
        </div>
        </div>
`;
}