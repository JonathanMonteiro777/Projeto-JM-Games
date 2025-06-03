/* Rola a pagina suavemente para o topo*/
export function scrollToTop() {
    window.scrollTo({
        top: 0, 
        behavior: 'smooth'
    });
}