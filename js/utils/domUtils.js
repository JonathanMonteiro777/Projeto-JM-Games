/**
 * Controla a visibilidade e a transição do botão "Voltar ao Topo".
 * Esta função será chamada por um event listener de scroll no main.js.
 */
export function handleScrollToTopButton() {
    const btnVoltarTopo = document.getElementById('voltar-topo');
    if (!btnVoltarTopo) return;

    if (window.scrollY > 300) {
        btnVoltarTopo.style.display = 'block';
        // Pequeno delay para garantir que a transição CSS de opacidade ocorra
        setTimeout(() => btnVoltarTopo.style.opacity = '1', 50);
    } else {
        btnVoltarTopo.style.opacity = '0';
        // Esconde o botão completamente após a transição de opacidade
        setTimeout(() => btnVoltarTopo.style.display = 'none', 300);
    }
}

/**
 * --- Exibe uma notificação toast personalizada usando Bootstrap ---
 * @param {string} message - A mensagem a ser exibida no toast.
 * @param {string} type - O tipo de toast ('success', 'danger', 'info', 'warning'). Mapeia para bg-bootstrap.
 */
export function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.warn('Elemento #toastContainer não encontrado. Notificações toast não serão exibidas.');
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', 'align-items-center', 'text-white', 'border-0', 'fade', 'show');

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
            toast.classList.add('bg-primary'); // Usando primary como default para info
            break;
    }

    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    toastContainer.appendChild(toast);

    // Inicializa e mostra o toast usando o JavaScript do Bootstrap
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 }); // Duração de 3 segundos
    bsToast.show();

    // Remove o elemento toast do DOM após ele ser ocultado
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}