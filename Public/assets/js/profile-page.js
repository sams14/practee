$(document).ready(function(){
  $('[data-toggle="datepicker"]').datepicker({
    // options here
    startDate: new Date(),
    filter: function(date, view) {
      if (date.getDay() === 0 && view === 'day') {
        return false; // Disable all Sundays, but still leave months/years, whose first day is a Sunday, enabled.
      }
      if (date.getDay() === 6 && view === 'day') {
        return false; // Disable all Sundays, but still leave months/years, whose first day is a Sunday, enabled.
      }
    }
  });
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

function ExportToExcel(date, type, fn, dl) {
  var elt = document.getElementById('tbl_exporttable_to_xls');
  var wb = XLSX.utils.table_to_book(elt, { sheet: date, raw:true });
  return dl ?
    XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
    XLSX.writeFile(wb, fn || ('Roster-Report.' + (type || 'xlsx')));
}