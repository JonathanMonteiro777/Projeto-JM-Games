// // js/services/rawgApi.js

// // Substitua com SUA CHAVE DA RAPIDAPI!
// const RAPIDAPI_KEY = '7ef43e2245msha546c4c125d9828p1bcf6cjsn36ef0666ec44';
// const RAPIDAPI_HOST = 'rawg-video-games-database.p.rapidapi.com';
// const RAPIDAPI_BASE_URL = `https://${RAPIDAPI_HOST}`; // Base URL da RapidAPI para RAWG

// /**
//  * Busca uma lista de jogos da API RAWG via RapidAPI.
//  * @param {Object} [params={}] - Parâmetros adicionais para a requisição (ex: { page_size: 10, ordering: '-rating' }).
//  * @returns {Promise<Array>} Uma Promise que resolve para um array de objetos de jogo.
//  */
// export async function fetchGames(params = {}) {
//     // Constrói a URL completa. O endpoint é /games, e os parâmetros da RAWG vão como searchParams.
//     const url = new URL(`${RAPIDAPI_BASE_URL}/games`);

//     // Adiciona parâmetros dinâmicos passados para a função
//     // Estes são os parâmetros da API RAWG que você quer usar (page_size, ordering, etc.)
//     for (const key in params) {
//         url.searchParams.append(key, params[key]);
//     }

//     // Define as opções para a requisição fetch, incluindo os headers da RapidAPI
//     const options = {
//         method: 'GET',
//         headers: {
//             'x-rapidapi-key': RAPIDAPI_KEY,
//             'x-rapidapi-host': RAPIDAPI_HOST
//         }
//     };

//     console.log('DEBUG: URL da requisição:', url.toString()); // Adicione esta linha
//     console.log('DEBUG: Opções da requisição:', options);

//     try {
//         const response = await fetch(url, options); // Passa a URL e as opções com os headers

//         if (!response.ok) {
//             // Se a resposta não for OK, tenta ler o corpo do erro (se houver)
//             const errorText = await response.text();
//             throw new Error(`Erro HTTP ao buscar jogos: ${response.status} - ${errorText}`);
//         }

//         const data = await response.json(); // <-- IMPORTANTE: Use .json() para parsear a resposta JSON
//         return data.results; // A API RAWG (mesmo via RapidAPI) retorna os jogos dentro de 'results'
//     } catch (error) {
//         console.error('Erro ao buscar jogos da API RAWG via RapidAPI:', error);
//         throw error; // Relança o erro para que quem chamou a função possa tratá-lo
//     }
// }

// // ... (se você tiver outras funções de API aqui, ajuste-as da mesma forma)