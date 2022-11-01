$(document).ready(function () {
  let mentors = JSON.parse(mentor);
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
  console.log(mentors);

  $('select[name="mentor"]').change(function () {
    // console.log($(this).val());
    let selectedMentor = $(this).val();
    $.each(mentors, function (key, mentor) {
      let name = mentor.first_name + " " + mentor.last_name;
      // console.log(mentor.first_name + " " + mentor.last_name);
      if (selectedMentor === name) {
        $("#mentorMail").val(mentor.email);
      }
    });
    console.log($("#mentorMail").val());
  });

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

const createForm = document.getElementById("createPipForm");
createForm.addEventListener("submit", (e) => {
  e.preventDefault();
  formData = {
    mentor: $('select[name="mentor"]').val(),
    mentorMail: $('input[name="mentorMail"]').val(),
    pipStartDate: $('input[name="pipStartDate"]').val(),
    pipDuration: $('select[name="pipDuration"]').val(),
    pipEndDate: $('input[name="pipEndDate"]').val(),
    improvmentObjectives: $('textarea[name="improvmentObjectives"]').val(),
    successCriteria: $('textarea[name="successCriteria"]').val(),
    additionalSupportRequired: $(
      'textarea[name="additionalSupportRequired"]'
    ).val(),
    reviewSchedule: $('textarea[name="reviewSchedule"]').val(),
    objectiveOutcome: $('textarea[name="objectiveOutcome"]').val(),
  };

  console.log(formData);
  axios
    .post("/utility/new-form", formData)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
});
