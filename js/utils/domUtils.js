/**
 * @file domUtils.js
 * @description Módulo de utilitários para manipulação do DOM e exibição de elementos visuais,
 * como o botão "Voltar ao Topo" e notificações toast.
 * @version 1.0.0
 */

/**
 * Controla a visibilidade e a transição de opacidade do botão "Voltar ao Topo".
 * O botão aparece quando o usuário rola a página para baixo e desaparece ao rolar para cima.
 * Esta função é tipicamente acionada por um event listener de scroll.
 */
export function handleScrollToTopButton() {
    const btnVoltarTopo = document.getElementById('voltar-topo');
    if (!btnVoltarTopo) {
        // console.warn('Elemento #voltar-topo não encontrado. A função de scroll ao topo não será ativada.');
        return;
    }

    if (window.scrollY > 300) {
        // Exibe o botão e inicia a transição de opacidade
        btnVoltarTopo.style.display = 'block';
        setTimeout(() => btnVoltarTopo.style.opacity = '1', 50);
    } else {
        // Inicia a transição de opacidade para ocultar o botão
        btnVoltarTopo.style.opacity = '0';
        // Esconde o botão completamente após a transição de opacidade (para não ocupar espaço)
        setTimeout(() => btnVoltarTopo.style.display = 'none', 300);
    }
}

/**
 * Exibe uma notificação toast personalizada usando os componentes do Bootstrap.
 * O toast é automaticamente ocultado após um período e removido do DOM.
 *
 * @param {string} message - A mensagem textual a ser exibida dentro do toast.
 * @param {'success' | 'danger' | 'info' | 'warning'} [type='info'] - O tipo de toast, que define a cor de fundo.
 * - 'success': Fundo verde (bg-success).
 * - 'danger': Fundo vermelho (bg-danger).
 * - 'warning': Fundo amarelo (bg-warning).
 * - 'info': Fundo azul (bg-primary), padrão se nenhum tipo for especificado ou se for inválido.
 */
export function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.warn('Elemento #toastContainer não encontrado. Notificações toast não serão exibidas.');
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', 'align-items-center', 'text-white', 'border-0', 'fade', 'show');

    // Define a classe de cor com base no tipo
    switch (type) {
        case 'success':
            toast.classList.add('bg-success');
            break;
        case 'danger':
            toast.classList.add('bg-danger');
            break;
        case 'warning':
            toast.classList.add('bg-warning');
            break;
        case 'info':
        default:
            toast.classList.add('bg-primary'); // Usando primary como padrão para 'info'
            break;
    }

    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive'); // Anuncia o toast para leitores de tela
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar notificação"></button>
        </div>
    `;
    toastContainer.appendChild(toast);

    // Inicializa e exibe o toast usando o JavaScript do Bootstrap
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 }); // Duração de 3 segundos
    bsToast.show();

    // Remove o elemento toast do DOM após a transição de ocultação completa
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}