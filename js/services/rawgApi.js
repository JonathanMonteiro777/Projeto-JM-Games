 // js/services/rawgApi.js


 const RAWGAPI_KEY = '2b184dbb00b5459e8cec4295f5adca91'; // Chave da API 
 const RAWGAPI_HOST = 'https://api.rawg.io/api/'; // Host da API RAWG



//  * Busca uma lista de jogos da API RAWG.
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
        throw error; // Relança o erro para que quem chamou a função possa tratá-lo
    }
}