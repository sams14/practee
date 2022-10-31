$(document).ready(function () {
  $('[data-toggle="datepicker"]').datepicker({
    // options here
    startDate: new Date(),
    // filter: function (date, view) {
    //   if (date.getDay() === 0 && view === "day") {
    //     return false; // Disable all Sundays, but still leave months/years, whose first day is a Sunday, enabled.
    //   }
    //   if (date.getDay() === 6 && view === "day") {
    //     return false; // Disable all Sundays, but still leave months/years, whose first day is a Sunday, enabled.
    //   }
    // },
  });

  $("#pipStartDate").datepicker("setDate", new Date());
  console.log($('input[name="pipDuration"]').val());

  var $date = $("#pipEndDate").datepicker();
  $('select[name="pipDuration"]').change(function () {
    if ($(this).val() == "NA") {
      $("#pipEndDate").val("");
    } else if ($(this).val() == "2 Weeks") {
      $("#pipEndDate").datepicker("setDate", addDays(new Date(), 14));
    } else if ($(this).val() == "4 Weeks") {
      $("#pipEndDate").datepicker("setDate", addDays(new Date(), 28));
    } else if ($(this).val() == "6 Weeks") {
      $("#pipEndDate").datepicker("setDate", addDays(new Date(), 42));
    }
  });
});

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
