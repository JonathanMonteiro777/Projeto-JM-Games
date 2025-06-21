// js/services/rawgApi.js

/**
 * @file Arquivo de serviço para interagir com a API RAWG.
 * @description Contém funções para buscar jogos, gêneros, plataformas e detalhes de jogos.
 */

/**
 * Chave de API para autenticação na RAWG API.
 * @type {string}
 */
const RAWGAPI_KEY = '2b184dbb00b5459e8cec4295f5adca91'; 

/**
 * URL base para a RAWG API.
 * @type {string}
 */
const RAWGAPI_HOST = 'https://api.rawg.io/api/'; 

/**
 * Função utilitária interna para realizar requisições HTTP à API RAWG.
 * Centraliza o tratamento de erros e a conversão para JSON.
 * @private
 * @param {string} endpoint - O endpoint específico da API (ex: 'games', 'genres').
 * @param {Object} [params={}] - Um objeto de parâmetros de consulta a serem adicionados à URL.
 * @returns {Promise<Object>} Uma promessa que resolve para os dados JSON da resposta da API.
 * @throws {Error} Se a requisição HTTP falhar ou a resposta da API indicar um erro.
 */
async function apiRequest(endpoint, params = {}) {
    const url = new URL(`${RAWGAPI_HOST}${endpoint}`);
    url.searchParams.append('key', RAWGAPI_KEY);

    for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    }

    console.log(`DEBUG: URL da requisição para ${endpoint}:`, url.toString());

    try {
        const response = await fetch(url);

        if (!response.ok) {
            let errorDetail = response.statusText;
            try {
                // Tenta parsear o corpo da resposta para uma mensagem de erro mais detalhada
                const errorData = await response.json();
                errorDetail = errorData.detail || errorData.error || errorDetail;
            } catch (jsonError) {
                // Ignora se não conseguir parsear JSON, usa o statusText padrão
                console.warn('Não foi possível parsear o JSON de erro:', jsonError);
            }
            throw new Error(`Erro HTTP! Status: ${response.status} - ${errorDetail}`);
        }

        const data = await response.json();
        console.log(`DEBUG: Dados JSON da API para ${endpoint}:`, data);
        return data;
    } catch (error) {
        console.error(`Erro ao realizar requisição para ${endpoint} na API RAWG:`, error);
        throw error; // Re-lança o erro para ser tratado por quem chamou a função
    }
}

/**
 * Busca uma lista de jogos da API RAWG.
 * @param {Object} [params={}] - Parâmetros de filtro para a busca de jogos (ex: { genres: 'action', page_size: 20 }).
 * @returns {Promise<Object>} Uma promessa que resolve para um objeto contendo os resultados dos jogos e metadados de paginação.
 * @throws {Error} Se a requisição à API falhar.
 */
export async function fetchGames(params = {}) {
    return apiRequest('games', params);
}

/**
 * Busca os detalhes completos de um jogo específico pelo seu ID na API RAWG.
 * Esta função foi padronizada para `fetchGameDetails` conforme discutimos.
 * @param {number|string} gameId - O ID do jogo a ser buscado.
 * @returns {Promise<Object>} Uma promessa que resolve para os dados detalhados do jogo.
 * @throws {Error} Se o ID do jogo não for fornecido ou se a requisição à API falhar.
 */
export async function fetchGameDetails(gameId) {
    if (!gameId) {
        throw new Error('ID do jogo é necessário para buscar detalhes.');
    }
    return apiRequest(`games/${gameId}`);
}

/**
 * Busca uma lista de gêneros disponíveis na API RAWG.
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de objetos de gênero.
 * @throws {Error} Se a requisição à API falhar.
 */
export async function fetchGenres() {
    const data = await apiRequest('genres');
    return data.results; // A API RAWG retorna os gêneros dentro de 'results'
}

/**
 * Busca uma lista de plataformas disponíveis na API RAWG.
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de objetos de plataforma.
 * @throws {Error} Se a requisição à API falhar.
 */
export async function fetchPlatforms() {
    const data = await apiRequest('platforms');
    return data.results; // A API RAWG retorna as plataformas dentro de 'results'
}


/**
 * Busca as screenshots de um jogo específico pelo seu ID na API RAWG.
 * @param {number|string} gameId - O ID do jogo para o qual buscar as screenshots.
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de objetos de screenshot.
 * @throws {Error} Se a requisição à API falhar.
 */
export async function fetchGameScreenshots(gameId) {
    if (!gameId) {
        throw new Error('ID do jogo é necessário para buscar screenshots.');
    }
    try {
        const data = await apiRequest(`games/${gameId}/screenshots`);
        console.log(`DEBUG: Screenshots recebidos para gameId ${gameId}:`, data.results); // Log para depuração
        return data.results || []; // A API RAWG retorna screenshots dentro de 'results'
    } catch (error) {
        console.error(`Erro ao buscar screenshots para o jogo ${gameId}:`, error);
        return []; // Retorna array vazio em caso de erro
    }
}