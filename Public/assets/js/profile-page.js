$(document).ready(function () {
  $('[data-toggle="datepicker"]').datepicker({
    // options here
    startDate: new Date(),
    filter: function (date, view) {
      if (date.getDay() === 0 && view === "day") {
        return false; // Disable all Sundays, but still leave months/years, whose first day is a Sunday, enabled.
      }
      if (date.getDay() === 6 && view === "day") {
        return false; // Disable all Sundays, but still leave months/years, whose first day is a Sunday, enabled.
      }
    },
  });
});
