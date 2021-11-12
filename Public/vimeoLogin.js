$(document).ready(function() {
    if (Message) {
        Swal.fire('Oops...', Message, 'error')
        document.getElementById("user").value = "";
        document.getElementById("pass").value = "";
    }

    $("#do_login").click(function() {
        closeLoginInfo();
        $(this).parent().find('span').css("display", "none");
        $(this).parent().find('span').removeClass("i-save");
        $(this).parent().find('span').removeClass("i-warning");
        $(this).parent().find('span').removeClass("i-close");

        var proceed = true;
        $("#login_form input").each(function() {

            if (!$.trim($(this).val())) {
                $(this).parent().find('span').addClass("i-warning");
                $(this).parent().find('span').css("display", "block");
                proceed = false;
            }
        });

        if (proceed) //everything looks good! proceed...
        {
            $(this).parent().find('span').addClass("i-save");
            $(this).parent().find('span').css("display", "block");
        }
    });

    $("#myform").on("submit", function() {
        var name, mail;
        name = document.getElementById("user").value;
        if (name == "") {
            alert("Enter a Valid NAME");
            return false;
        }
        mail = document.getElementById("pass").value;
        if (mail == "") {
            alert("Enter a Valid E-Mail ID");
            return false;
        }
        $("#pageloader").fadeIn();
    });

    //reset previously results and hide all message on .keyup()
    $("#login_form input").keyup(function() {
        $(this).parent().find('span').css("display", "none");
    });
    
});

function openLoginInfo() {
    $(document).ready(function() {
        $('.b-form').css("opacity", "0.01");
        $('.box-form').css("left", "-37%");
        $('.box-info').css("right", "-37%");
    });
}

function closeLoginInfo() {
    $(document).ready(function() {
        $('.b-form').css("opacity", "1");
        $('.box-form').css("left", "0px");
        $('.box-info').css("right", "-5px");
    });
}


$(window).on('resize', function() {
    closeLoginInfo();
});