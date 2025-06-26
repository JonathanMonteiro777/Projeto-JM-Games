/**
 * @file CarrinhoManager.js
 * @description Gerencia as operações do carrinho de compras, incluindo adição, remoção,
 * atualização de itens, persistência no localStorage e renderização na UI.
 * @version 1.0.0
 */

import { showToast } from '../utils/domUtils.js';

/**
 * @typedef {object} CartItem - Representa um item de produto no carrinho.
 * @property {string} id - O ID único do produto.
 * @property {string} name - O nome do produto.
 * @property {number} price - O preço unitário do produto.
 * @property {string} image - URL da imagem do produto.
 * @property {number} quantidade - A quantidade do produto no carrinho.
 */

/**
 * Gerencia o estado e as interações do carrinho de compras.
 */
export class CarrinhoManager {
    /**
     * Cria uma instância do CarrinhoManager.
     * Carrega o carrinho do localStorage e o renderiza na inicialização.
     */
    constructor() {
        /** @private @type {CartItem[]} A lista de itens no carrinho. */
        this.carrinho = this.carregarCarrinho();
        this.renderizarCarrinho();
    }

    /**
     * Carrega o carrinho de compras do `localStorage`.
     * Se não houver dados salvos ou ocorrer um erro, retorna um array vazio.
     * @returns {CartItem[]} O array de itens do carrinho.
     * @private
     */
    carregarCarrinho() {
        try {
            const carrinhoSalvo = localStorage.getItem('carrinhoJM');
            return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
        } catch (e) {
            console.error("Erro ao carregar carrinho do localStorage:", e);
            showToast('Erro ao carregar carrinho. Seus itens podem ter sido perdidos.', 'danger');
            return [];
        }
    }

    /**
     * Salva o estado atual do carrinho no `localStorage`.
     * @private
     */
    salvarCarrinho() {
        localStorage.setItem('carrinhoJM', JSON.stringify(this.carrinho));
    }

    /**
     * Adiciona um produto ao carrinho. Se o produto já existir, incrementa sua quantidade.
     * Atualiza o `localStorage` e a UI.
     * @param {object} produto - O objeto do produto a ser adicionado.
     * @param {string} produto.id - O ID do produto.
     * @param {string} produto.name - O nome do produto.
     * @param {number} produto.price - O preço do produto.
     * @param {string} produto.image - A URL da imagem do produto.
     */
    adicionarItem(produto) {
        const itemExistente = this.carrinho.find(item => item.id === produto.id);
        if (itemExistente) {
            itemExistente.quantidade++;
        } else {
            this.carrinho.push({ ...produto, quantidade: 1 });
        }
        this.salvarCarrinho();
        this.renderizarCarrinho();
        showToast(`"${produto.name}" adicionado ao carrinho!`, 'success');
    }

    /**
     * Remove um item do carrinho com base no seu ID.
     * Atualiza o `localStorage` e a UI.
     * @param {string} productId - O ID do produto a ser removido.
     */
    removerItem(productId) {
        // Encontra o nome do produto antes de remover para exibir no toast
        const itemParaRemover = this.carrinho.find(item => item.id === productId);
        const productName = itemParaRemover ? itemParaRemover.name : 'Produto';

        this.carrinho = this.carrinho.filter(item => item.id !== productId);
        this.salvarCarrinho();
        this.renderizarCarrinho();
        showToast(`"${productName}" removido do carrinho.`, 'info');
    }

    /**
     * Atualiza a quantidade de um produto específico no carrinho.
     * Se a quantidade for zero ou negativa, o item é removido.
     * Atualiza o `localStorage` e a UI.
     * @param {string} productId - O ID do produto cuja quantidade será atualizada.
     * @param {number|string} quantidade - A nova quantidade do produto.
     */
    atualizarQuantidade(productId, quantidade) {
        const item = this.carrinho.find(item => item.id === productId);
        if (item) {
            item.quantidade = parseInt(quantidade, 10); // Garante que seja um número inteiro
            if (item.quantidade <= 0) {
                this.removerItem(productId);
            } else {
                this.salvarCarrinho();
                this.renderizarCarrinho();
            }
        }
    }

    /**
     * Calcula o valor total de todos os itens no carrinho.
     * @returns {number} O valor total do carrinho.
     */
    calcularTotal() {
        return this.carrinho.reduce((total, item) => total + (item.price * item.quantidade), 0);
    }

    /**
     * Renderiza o conteúdo do carrinho na interface do usuário (UI).
     * Atualiza a lista de itens, o total e o contador de itens no cabeçalho.
     */
    renderizarCarrinho() {
        const carrinhoLista = document.getElementById('carrinho-lista');
        const carrinhoTotal = document.getElementById('carrinho-total');
        const cartItemCountSpan = document.getElementById('cart-item-count'); // Contador de itens no cabeçalho do carrinho

        // Retorna silenciosamente se os elementos do carrinho não forem encontrados,
        // o que é esperado se não estiver na página do carrinho.
        if (!carrinhoLista || !carrinhoTotal) {
            return;
        }

        carrinhoLista.innerHTML = ''; // Limpa a lista existente

        if (this.carrinho.length === 0) {
            carrinhoLista.innerHTML = '<li class="list-group-item text-center">Seu carrinho está vazio.</li>';
        } else {
            this.carrinho.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                li.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 5px;">
                        <div>
                            <strong class="d-block">${item.name}</strong>
                            <span class="text-muted">R$ ${item.price.toFixed(2)}</span>
                            <input type="number" class="form-control form-control-sm d-inline-block ms-2" style="width: 70px;"
                                       value="${item.quantidade}" min="1" data-product-id="${item.id}">
                        </div>
                    </div>
                    <button class="btn btn-danger btn-sm remove-item" data-product-id="${item.id}" aria-label="Remover ${item.name} do carrinho">
                        <i class="bi bi-trash"></i>
                    </button>
                `;
                carrinhoLista.appendChild(li);
            });
        }
        carrinhoTotal.textContent = this.calcularTotal().toFixed(2);

        // Atualiza a contagem de itens no cabeçalho do carrinho
        if (cartItemCountSpan) {
            // Conta a soma das quantidades de todos os itens no carrinho
            const totalItens = this.carrinho.reduce((sum, item) => sum + item.quantidade, 0);
            cartItemCountSpan.textContent = totalItens.toString(); // Converte para string
            cartItemCountSpan.style.display = totalItens > 0 ? 'block' : 'none'; // Exibe ou oculta o contador
        }

        // Adiciona eventos aos botões de remover e inputs de quantidade (delegação para elementos renderizados)
        // Usamos event delegation aqui para garantir que os listeners funcionem para elementos adicionados dinamicamente.
        carrinhoLista.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (event) => {
                // Usa closest para garantir que o click no ícone também funcione
                const productId = event.target.closest('.remove-item').dataset.productId;
                this.removerItem(productId);
            });
        });

        carrinhoLista.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('change', (event) => {
                const productId = event.target.dataset.productId;
                const newQuantity = event.target.value;
                this.atualizarQuantidade(productId, newQuantity);
            });
        });
    }

    /**
     * Esvazia completamente o carrinho de compras.
     * Atualiza o `localStorage` e a UI.
     */
    limparCarrinho() {
        this.carrinho = [];
        this.salvarCarrinho();
        this.renderizarCarrinho();
        showToast('Carrinho limpo.', 'info');
    }
}