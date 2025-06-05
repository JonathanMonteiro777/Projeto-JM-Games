// js/classes/CarrinhoManager.js

import { showToast } from '../utils/domUtils.js'; // Importa a função de toast

export class CarrinhoManager {
    constructor() {
        this.carrinho = this.carregarCarrinho();
        this.renderizarCarrinho();
    }

    carregarCarrinho() {
        try {
            const carrinhoSalvo = localStorage.getItem('carrinhoJM');
            return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
        } catch (e) {
            console.error("Erro ao carregar carrinho do localStorage:", e);
            return [];
        }
    }

    salvarCarrinho() {
        localStorage.setItem('carrinhoJM', JSON.stringify(this.carrinho));
    }

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

    removerItem(productId) {
        this.carrinho = this.carrinho.filter(item => item.id !== productId);
        this.salvarCarrinho();
        this.renderizarCarrinho();
        showToast('Produto removido do carrinho.', 'info');
    }

    atualizarQuantidade(productId, quantidade) {
        const item = this.carrinho.find(item => item.id === productId);
        if (item) {
            item.quantidade = parseInt(quantidade);
            if (item.quantidade <= 0) {
                this.removerItem(productId);
            } else {
                this.salvarCarrinho();
                this.renderizarCarrinho();
            }
        }
    }

    calcularTotal() {
        return this.carrinho.reduce((total, item) => total + (item.price * item.quantidade), 0);
    }

    renderizarCarrinho() {
        const carrinhoLista = document.getElementById('carrinho-lista');
        const carrinhoTotal = document.getElementById('carrinho-total');
        const cartItemCountSpan = document.getElementById('cart-item-count'); // Contador de itens no cabeçalho do carrinho

        if (!carrinhoLista || !carrinhoTotal) {
            // console.warn("Elementos do carrinho (lista ou total) não encontrados. Verifique IDs.");
            return; // Retorna silenciosamente se não estiver na página com o carrinho
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
                    <button class="btn btn-danger btn-sm remove-item" data-product-id="${item.id}">
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
            cartItemCountSpan.textContent = totalItens.toString(); // converte para string
            cartItemCountSpan.style.display = totalItens > 0 ? 'block' : 'none'; // Exibe ou oculta o contador
        }

        // Adiciona eventos aos botões de remover e inputs de quantidade
        carrinhoLista.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.closest('button').dataset.productId;
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

    limparCarrinho() {
        this.carrinho = [];
        this.salvarCarrinho();
        this.renderizarCarrinho();
        showToast('Carrinho limpo.', 'info');
    }
}