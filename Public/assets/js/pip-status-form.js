$(document).ready(function () {
  $('[data-toggle="datepicker"]').datepicker({
    // options here
    startDate: new Date(),
  });

  $("#pipStatus").change(function () {
    if ($(this).val() == "Extend") {
      $("#extendPipDiv").attr("hidden", false);
    } else {
      $("#extendPipDiv").attr("hidden", true);
    }
  });

  $("#updatePipStatus").submit(function (e) {
    e.preventDefault();
    formData = {
      pipStatus: $('select[name="pipStatus"]').val(),
    };
    if ($('select[name="pipStatus"]').val() == "Extend") {
      if ($('select[name="extendPIP"]').val() == "2 Weeks") {
        formData["pipDuration"] =
          (
            parseInt($('select[name="pipDuration"]').val().split(" ")[0]) + 2
          ).toString() + " Weeks";

        $("#pipEndDate").datepicker(
          "setDate",
          addDays($("#pipEndDate").val(), 14)
        );
      } else if ($('select[name="extendPIP"]').val() == "4 Weeks") {
        formData["pipDuration"] =
          (
            parseInt($('select[name="pipDuration"]').val().split(" ")[0]) + 4
          ).toString() + " Weeks";

        $("#pipEndDate").datepicker(
          "setDate",
          addDays($("#pipEndDate").val(), 28)
        );
      }
      formData["pipEndDate"] = $("#pipEndDate").val();
    }
    console.log(formData);
    const url = window.location.href;
    axios
      .put(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        Swal.fire("Done !", res.data.message, "success").then((res) => {
          location.replace("../profile");
        });
      })
      .catch((err) => {
        Swal.fire("Oops...", err, "error");
      });
  });
});

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
