$(function(){
  $("a#login,#wrapper").click(function(){
		$("#formlogin").toggle();
		$("#wrapper").toggle();
  });
  $(window).resize(function() {
        var devicewidth = document.documentElement.clientWidth;
        console.log(devicewidth);
        if (devicewidth >= 1024) {
            $("#animatealert").css("display", "none");
        } else {
          $("#animatealert").css("display", "block").addClass("animated fadeIn ");
        }
    })
});
