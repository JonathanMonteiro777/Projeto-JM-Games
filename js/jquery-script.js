//efeito de esconder formulário de cadastro

//este comando inicializa o jquery
$(document).ready(function () {

    //esta ação vai chamar os efeitos inseridas dentro das suas chaves
    $("#botao-cadastrar").click(function () {

        //o slideToggle(slow) deixa o formulario oculto caso ele esteja visivel ou vice versa
        $("#form-cadastrar").slideToggle("slow");
        $("#section-login").slideToggle("slow");
        $("#botao-cadastrar").hide(); //.hide() faz o botão cadastrar ficar oculto

    })
});
