# 🎮 JM Games: Seu Portal para o Universo Gamer! 🚀

![Preview em desktop](/img/preview-desktop.jpeg)

![Preview em dispositivos móveis](/img/preview-mobile.png)

---

## 📄 Sobre o Projeto

Este projeto é uma simulação avançada de **e-commerce de games online**, desenvolvido como parte do curso de **Desenvolvimento Web FullStack do SENAI**. Ele é uma demonstração prática da minha proficiência em **HTML5, CSS3 (com Bootstrap 5) e JavaScript (ESM - Módulos ES)**, focando na criação de uma experiência de usuário (UX) interativa, intuitiva e **totalmente responsiva**.

O site foi construído seguindo um processo de desenvolvimento completo, que incluiu **briefing com cliente, prototipação em baixa e alta fidelidade com Figma**, e a subsequente **codificação front-end**. Meu principal objetivo foi traduzir o design em uma interface funcional e visualmente atraente, com forte ênfase na **usabilidade**, **modularidade do código** e **adaptabilidade impecável** para qualquer dispositivo.

---

## ✨ Funcionalidades Principais Implementadas

### Módulos Essenciais (Core Features)

- **Sistema de Autenticação (Login/Cadastro) Robusto:**
  - Formulários de Login e Cadastro unificados, com alternância dinâmica em `login.html`.
  - **`AuthManager` completo**: Gerencia login, cadastro, validação de formulários (com `validationUtils.js`), e persistência segura via localStorage.
  - Atualiza dinamicamente a interface da navbar com base no status do usuário.
- **Carrinho de Compras Completo:**
  - **`CarrinhoManager` funcional**: Permite adicionar, remover, atualizar quantidade de itens e calcular o total. Todos os dados são persistidos via localStorage.
  - Integração no `index.html` com botões "Adicionar ao Carrinho" e um offcanvas dedicado para exibição e gerenciamento do carrinho.
- **Sistema de Favoritos Abrangente:**
  - **`FavoritosManager` funcional**: Permite adicionar e remover jogos da lista de favoritos, com persistência via localStorage.
  - Integração no `index.html` com botões "Adicionar aos Favoritos" e um offcanvas para visualização e gerenciamento dos favoritos.

### Interatividade e Conteúdo Dinâmico

- **Sistema de Busca e Filtragem Avançado com Paginação (RAWG API):**
  - **`BuscaManager` centralizado**: Gerencia a busca de jogos por texto livre, filtros por gênero e plataforma (via menu hambúrguer), e a navegação por paginação.
  - Integração profunda com a **API RAWG (`rawgApi.js`)** para dados de jogos em tempo real.
  - Exibição de **Loading States** (spinners) e mensagens de "Nenhum resultado encontrado".
  - A paginação permite navegar eficientemente por grandes volumes de resultados.
- **Página de Detalhes do Produto (`detalhes.html`):**
  - Exibe informações detalhadas de jogos, enriquecidas com uma **galeria de screenshots interativa**.
- **Notificações Toast:**
  - Função `showToast` (`domUtils.js`) para feedback visual claro e instantâneo ao usuário em todas as ações (adição/remoção de itens, login/logout, etc.).
- **Carrossel Interativo de Banners:** Apresenta promoções e destaques de jogos de forma dinâmica na página inicial.
- **Destaque de Produtos:** Seções dedicadas a "Novidades" e "Mais Vendidos" exibem cards de produtos com imagem, descrição, preço e botão "Comprar".
- **Botão "Voltar ao Topo":** Navegação rápida e conveniente para o início da página em todas as páginas relevantes.

### Qualidade de Código e Experiência do Usuário

- **Modularização Completa do JavaScript (ES Modules):** Código organizado em classes e módulos (ex: `AuthManager`, `BuscaManager`, `CarrinhoManager`, `FavoritosManager`, `rawgApi.js`, `domUtils.js`, `helpers.js`, `validationUtils.js`), promovendo reusabilidade, manutenibilidade e escalabilidade.
- **Validação de Formulários:** Implementada de forma robusta, garantindo a integridade dos dados inseridos pelo usuário.
- **Estilização Profissional:**
  - **Design System Customizado:** Utilização de variáveis CSS (`_variables.css`) para cores e tipografia, garantindo consistência e facilidade de manutenção.
  - **Paleta de cores:** `#1a73e8` (azul Google) e `#f4b400` (amarelo Google) para uma identidade visual moderna e profissional.
  - **Tipografia:** `Open Sans` (corpo) e `Montserrat` (títulos) para harmonia visual.
  - Componentes visuais limpos e modernos: cards, botões, formulários.
  - **Hover effects e transições** suaves para uma experiência interativa.
- **Responsividade Robusta:**
  - **Ajustes finos nas `media queries`** para garantir que todos os elementos (textos, imagens, cards, botões) se adaptem perfeitamente a diferentes tamanhos de tela (desktop, tablet e mobile), proporcionando uma **experiência fluida em qualquer dispositivo**.
  - **Otimização de Imagens:** Implementação de `object-fit` e `max-height` com breakpoints para garantir que as imagens dos produtos e banners se ajustem visualmente sem distorções.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estruturação semântica e acessível de todo o conteúdo do site.
- **CSS3:** Estilização completa da interface, com foco em:
  - **Bootstrap 5:** Framework amplamente utilizado para construção rápida de layouts responsivos e componentes pré-estilizados.
  - **Design System Customizado:** Aplicação de variáveis CSS para cores e tipografia, garantindo consistência e facilidade de manutenção.
- **JavaScript (ESM - ES6 Modules):** Implementação de toda a lógica interativa e funcional do lado do cliente, incluindo:
  - **Organização em Classes e Módulos:** `AuthManager`, `BuscaManager`, `CarrinhoManager`, `FavoritosManager`, etc.
  - **Integração com RAWG API:** Consumo de dados de jogos em tempo real.
  - **Manipulação do DOM** e gestão de eventos.
- **Google Fonts:** Para a tipografia moderna (`Montserrat` para títulos, `Open Sans` para o corpo do texto).
- **Bootstrap Icons:** Para ícones visuais que enriquecem a interface.
- **Git & GitHub:** Essenciais para controle de versão, colaboração e hospedagem do repositório.
- **Figma:** Ferramenta fundamental utilizada nas etapas de prototipação (baixa e alta fidelidade) e design de interface.

---

## ⚙️ Como Rodar o Projeto Localmente

1. Clone o repositório:

    ```bash
    git clone [https://github.com/JonathanMonteiro777/jm-games.git](https://github.com/JonathanMonteiro777/jm-games.git)
    ```

2. Navegue até o diretório do projeto:

    ```bash
    cd jm-games
    ```

3. Abra o arquivo `index.html` no seu navegador web de preferência.

---

## 💡 Desafios e Aprendizados

Este projeto foi uma oportunidade valiosa para aprofundar meus conhecimentos em desenvolvimento Front-End moderno e responsivo. Os principais desafios incluíram:

- **Consumo e Gestão de APIs:** Integrar e gerenciar dados de uma API externa (RAWG), incluindo paginação, filtros e tratamento de estados de carregamento.
- **Modularização de Código:** Estruturar um projeto JavaScript em módulos e classes para garantir escalabilidade, reusabilidade e fácil manutenção.
- **Delegação de Eventos:** Implementar uma estratégia eficiente para lidar com eventos em elementos dinamicamente criados, otimizando a performance.
- **Responsividade Abrangente:** Garantir que o layout se adaptasse perfeitamente a *todas* as telas, desde desktops de alta resolução até dispositivos móveis, refinando o uso de media queries e otimização de imagens.

A experiência de seguir o ciclo completo, do briefing e prototipação no Figma à codificação com um foco intenso em modularidade e UX, reforçou a importância do planejamento e do design thinking na criação de interfaces amigáveis e eficientes.

---

## 📧 Contato

### Jonathan Monteiro

- [LinkedIn](https://www.linkedin.com/in/jonathan-lucas-34684a1a4)
- Email: <jonathanlucas777@gmail.com>

**Observações:**

- As funcionalidades de login e cadastro são simulações front-end e não estão conectadas a um banco de dados real.
- O projeto está em constante desenvolvimento e novas funcionalidades e melhorias de performance estão planejadas.
