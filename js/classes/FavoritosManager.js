// js/classes/FavoritosManager.js

import { showToast } from '../utils/domUtils.js';

export class FavoritosManager {
    constructor() {
        this.favoritos = this.carregarFavoritos();
        this.renderizarFavoritos(); // Renderiza os favoritos ao iniciar
    }

    /**
     * Carrega os itens favoritos do localStorage.
     * @returns {Array} Um array de itens favoritos.
     */
    carregarFavoritos() {
        try {
            const favoritosSalvos = localStorage.getItem('favoritosJM');
            return favoritosSalvos ? JSON.parse(favoritosSalvos) : [];
        } catch (e) {
            console.error("Erro ao carregar favoritos do localStorage:", e);
            return [];
        }
    }

    /**
     * Salva os itens favoritos no localStorage.
     */
    salvarFavoritos() {
        localStorage.setItem('favoritosJM', JSON.stringify(this.favoritos));
    }

    /**
     * Adiciona um item aos favoritos.
     * Se o item já existir, ele é removido (toggle).
     * @param {Object} produto - O objeto do produto a ser adicionado/removido.
     */
    adicionarRemoverItem(produto) {
        const itemExistenteIndex = this.favoritos.findIndex(item => item.id === produto.id);

        if (itemExistenteIndex !== -1) {
            // Item já existe, remove (toggle)
            this.favoritos.splice(itemExistenteIndex, 1);
            showToast(`"${produto.name}" removido dos favoritos.`, 'info');
        } else {
            // Item não existe, adiciona
            this.favoritos.push(produto);
            showToast(`"${produto.name}" adicionado aos favoritos!`, 'success');
        }
        this.salvarFavoritos();
        this.renderizarFavoritos(); // Re-renderiza a lista e o contador
        this.updateFavoriteButtonsUI(produto.id); // Atualiza o estado do botão no card
    }

    /**
     * Remove um item dos favoritos.
     * @param {string} productId - O ID do produto a ser removido.
     */
    removerItem(productId) {
        this.favoritos = this.favoritos.filter(item => item.id !== productId);
        this.salvarFavoritos();
        this.renderizarFavoritos();
        showToast('Produto removido dos favoritos.', 'info');
        this.updateFavoriteButtonsUI(productId); // Atualiza o estado do botão no card
    }

    /**
     * Limpa todos os itens dos favoritos.
     */
    limparFavoritos() {
        this.favoritos = [];
        this.salvarFavoritos();
        this.renderizarFavoritos();
        showToast('Lista de favoritos limpa.', 'info');
        // Atualiza todos os botões de favoritos para o estado "não favoritado"
        document.querySelectorAll('.add-to-favorites').forEach(button => {
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('bi-heart-fill');
                icon.classList.add('bi-heart');
            }
        });
    }

    /**
     * Verifica se um produto está nos favoritos.
     * @param {string} productId - O ID do produto a verificar.
     * @returns {boolean} True se o produto estiver nos favoritos, false caso contrário.
     */
    isFavorited(productId) {
        return this.favoritos.some(item => item.id === productId);
    }

    /**
     * Renderiza a lista de itens favoritos no Offcanvas e atualiza o contador do header.
     */
    renderizarFavoritos() {
        const favoritosLista = document.getElementById('favoritos-lista');
        const favoriteItemCountSpan = document.getElementById('favorite-item-count');

        if (!favoritosLista) {
             console.warn("Elemento #favoritos-lista não encontrado. Favoritos não serão renderizados.");
            return;
        }

        favoritosLista.innerHTML = ''; // Limpa a lista existente

        if (this.favoritos.length === 0) {
            favoritosLista.innerHTML = '<li class="list-group-item text-center">Nenhum item favorito ainda.</li>';
        } else {
            this.favoritos.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                li.innerHTML = `
                   <div class="d-flex align-items-center">
                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 5px;">
                <div>
                    <strong class="d-block">${item.name}</strong>
                    <span class="text-muted">R$ ${item.price?.toFixed(2) || 'Preço indisponivel'}</span>
                </div>
            </div>
            <button class="btn btn-danger btn-sm remove-favorite" data-product-id="${item.id}">
                <i class="bi bi-trash"></i>
            </button>`;
                favoritosLista.appendChild(li);
            });
        }
        // Atualiza a contagem de itens no cabeçalho
        if (favoriteItemCountSpan) {
            favoriteItemCountSpan.textContent = this.favoritos.length.toString();
            favoriteItemCountSpan.style.display = this.favoritos.length > 0 ? 'block' : 'none';
        }

        // Adiciona eventos aos botões de remover dentro do offcanvas de favoritos
        favoritosLista.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.closest('button').dataset.productId;
                this.removerItem(productId);
            });
        });
    }

    /**
     * Atualiza o ícone do botão de favoritar em um card específico.
     * @param {string} productId - O ID do produto cujo botão será atualizado.
     */
    updateFavoriteButtonsUI(productId) {
        const buttons = document.querySelectorAll(`.add-to-favorites[data-product-id="${productId}"]`);
        buttons.forEach(button => {
            const icon = button.querySelector('i');
            if (icon) {
                if (this.isFavorited(productId)) {
                    icon.classList.remove('bi-heart');
                    icon.classList.add('bi-heart-fill'); // Coração preenchido
                } else {
                    icon.classList.remove('bi-heart-fill');
                    icon.classList.add('bi-heart'); // Coração vazio
                }
            }
        });
    }

    /**
     * Percorre todos os botões de favoritar nos cards e atualiza seus estados.
     * Chamado na inicialização e sempre que os favoritos são renderizados.
     */
    updateAllFavoriteButtonsUI() {
        document.querySelectorAll('.add-to-favorites').forEach(button => {
            const productId = button.dataset.productId;
            this.updateFavoriteButtonsUI(productId);
        });
    }
}