// Este comando inicializa o jQuery quando o DOM estiver completamente carregado
$(document).ready(function () {

    // === CONTROLE DE EXIBIÇÃO DOS FORMULÁRIOS ===

    // Ação para exibir o formulário de cadastro e ocultar o de login
    $("#botao-cadastrar").click(function () {
        $("#section-login").slideToggle("slow", function() {
            console.log("CALLBACK EXECUTADO: Login oculto, agora tentando mostrar Cadastro.");
            // Callback: Após ocultar o login, mostra o cadastro
            $("#section-cadastro").show();
        });
        $(this).hide(); // Oculta o botão "Cadastrar-se"
    });

    // Ação para voltar ao formulário de login e ocultar o de cadastro
    $("#botao-voltar").click(function () {
        $("#section-cadastro").slideToggle("slow", function() {
            // Callback: Após ocultar o cadastro, mostra o login
            $("#section-login").slideToggle("slow");
        });
        $("#botao-cadastrar").show(); // Exibe o botão "Cadastrar-se" novamente
    });

    // === EFEITOS VISUAIS NOS CAMPOS DE FORMULÁRIO ===
    // Adiciona borda primária ao focar no input
    $("input").focus(function(){
        $(this).addClass("border-primary");
    });

    // Remove borda primária ao perder o foco do input
    $("input").blur(function(){
        $(this).removeClass("border-primary");
    });

    // === VALIDAÇÃO VISUAL EM TEMPO REAL (CAMPO E-MAIL) ===
    // Note: A função 'validarEmail' precisa ser acessível globalmente (estar em script.js carregado antes)
    $("#email").on("input", function () {
        const email = $(this).val();
        // A função 'validarEmail' é chamada do script.js
        if (email && !validarEmail(email)) {
            $(this).removeClass("is-valid").addClass("is-invalid");
        } else if (email && validarEmail(email)) {
            $(this).removeClass("is-invalid").addClass("is-valid");
        } else {
            // Campo vazio, remove ambas as classes de validação
            $(this).removeClass("is-valid is-invalid");
        }
    });

    // === MOSTRAR/ESCONDER SENHA ===
    $(".toggle-password").click(function() {
        // Encontra o input de senha que está antes do botão
        const input = $(this).prev("input");
        const icon = $(this).find("i");

        if (input.attr("type") === "password") {
            input.attr("type", "text");
            icon.removeClass("bi-eye-slash").addClass("bi-eye");
        } else {
            input.attr("type", "password");
            icon.removeClass("bi-eye").addClass("bi-eye-slash");
        }
    });

    // === ANIMAÇÃO SUAVE PARA BOTÕES (HOVER) ===
    $(".btn").hover(function(){
        $(this).addClass("shadow-sm"); // Corrigido 'sahdow-sm' para 'shadow-sm'
    }, function(){
        $(this).removeClass("shadow-sm");
    });

}); // Fim de $(document).ready()