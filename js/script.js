
//efeito do botão voltar ao Topo

function topo(){
    window.scrollTo(
        { top: 0, left: 0, behavior: "smooth" }
    )
}

//Validação de Login
function login(){
    var logado = 0;
    var usuario = document.getElementById("usuario").value;
    usuario = usuario.toLowerCase();
    var senha = document.getElementById("senha").value;
    senha = senha.toLowerCase();

    if( usuario == "lucas"  && senha == "123456"){
        window.location = "index.html";
        logado = 1;
    }
 //Ativar alert no botão cadastrar
    if(logado == 0){
        alert("Usuário ou senha incorretos");
    }
}