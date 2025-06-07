 // js/services/rawgApi.js


 const RAWGAPI_KEY = '2b184dbb00b5459e8cec4295f5adca91';  
 const RAWGAPI_HOST = 'https://api.rawg.io/api/'; 



// --- Busca uma lista de jogos da API RAWG ---
 export async function fetchGames(params = {}) {
    console.log(params);


    const url = new URL(`${RAWGAPI_HOST}games`);
    url.searchParams.append('key', RAWGAPI_KEY);

    for (const key in params) {
        url.searchParams.append(key, params[key]);
    }

    console.log('DEBUG: URL da requisição:', url.toString()); 

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro HTTP! Status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        console.log('DEBUG: Dados JSON da API:', data);
        return data.results;
        
    } catch (error) {

        console.error('Erro ao buscar jogos da API RAWG:', error);
        throw error; // Relança o erro 
    }
}

// Função para buscar um jogo específico por ID
export async function fetchGameById(gameId) {
    if (!gameId) {
        throw new Error('ID do jogo é necessário para buscar detalhes.');
    }

    const url = `${RAWGAPI_HOST}games/${gameId}?key=${RAWGAPI_KEY}`;
    console.log('DEBUG: URL da requisição por ID:', url);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro HTTP: ${response.status} - ${errorData.detail || response.statusText}`);
        }

        const data = await response.json();
        console.log('DEBUG: Dados do jogo por ID:', data);
        return data;
    } catch (error) {
        console.error(`Erro ao buscar jogo com ID ${gameId} da API RAWG:`, error);
        throw error; // Relança o erro
    }
}