$(function() {
    
  
    if (document.cookie.indexOf("user_name") != -1) {
        $("#logout").css("display","block");
        $("#formlogin").attr("disabled","disabled");
        $("#user_show_name").css("left","-30px");
    } else {
        $("#login").css("display","block");
        $("a#login,#wrapper").click(function() {
                $("#formlogin").toggle();
                $("#wrapper").toggle();
        });
        $("#user_show_name").text("訪客  您好。");
    }
    
    $('.carousel').carousel({
        interval: false
    });

    $("div.carousel-caption >a").on({
        "mouseenter": function() {
            $(".contentissue,.contentbrand").css("display", "block").addClass('animated fadeIn');
        },
        "mouseleave": function() {
            $(".contentissue,.contentbrand").css("display", "none").removeClass('animated fadeIn');
        },
    });

    $(window).resize(function() {
        var devicewidth = document.documentElement.clientWidth;
        if (devicewidth >= 1024) {
            $("#animatealert").css("display", "none");
        } else {
          $("#animatealert").css("display", "block").addClass("animated fadeIn ");
        }
    });
    
   
})