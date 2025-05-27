
// botão voltar ao Topo
function topo(){
    window.scrollTo(
        { top: 0, left: 0, behavior: 'smooth' }
    )
}

//Validação de Login
function login(){
    var usuario = document.getElementById("usuario-login").value;
    var senha = document.getElementById("senha-login").value;

    let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    let logado = usuarios.find(u => u.usuario === usuario && u.senha === senha);

    if(logado){
        // Armazenar o nome do usuario logado no sessionStorage
        sessionStorage.setItem("usuarioLogado", usuario);

        window.location = "index.html"; // redirecionar para o index apos o login
    } else {
        alert("Usuário ou senha incorretos");
    }
}

function cadastro(){
    var usuario = document.getElementById("usuario-cadastro").value;
    var email = document.getElementById("email").value;
    var senha = document.getElementById("senha-cadastro").value;

    if(usuario && email && senha){
        let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

        // Evita cadastros duplicados
        if (usuarios.find(u => u.usuario === usuario)) {
            alert("Usuário já existe!");
            return;
        }

        usuarios.push({ usuario, email, senha });
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        alert("Cadastro realizado com sucesso!");
        window.location = "index.html";
    } else {
        alert("Preencha todos os campos!");
    }


}