$(document).ready(function(){
    if ($('input[name="searchType"]:checked').val() == 'Mentor') {
      $('select[name="gender"]').attr("disabled",true);
      $('select[name="lang"]').attr("disabled",true);
      $('select[name="mentor"]').attr("disabled",false);
    }
    else {
      $('select[name="gender"]').attr("disabled",false);
      $('select[name="lang"]').attr("disabled",false);
      $('select[name="mentor"]').attr("disabled",true);
    }
    $('input[name="searchType"]').on('click', function() {
        if ($(this).val() == 'Mentor') {
            $('select[name="gender"]').attr("disabled",true);
            $('select[name="lang"]').attr("disabled",true);
            $('select[name="mentor"]').attr("disabled",false);
        }
        else if ($(this).val() == 'Gender') {
          $('select[name="gender"]').attr("disabled",false);
          $('select[name="lang"]').attr("disabled",false);
          $('select[name="mentor"]').attr("disabled",true);
        }
    });
    $('#submit_button').click(function() {
      $('tbody:not(#preloader)').hide();
      $('#preloader').show();
   });
});
