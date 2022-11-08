$(document).ready(function () {
  $('[data-toggle="datepicker"]').datepicker({
    // options here
    startDate: new Date(),
  });

  $("#updatePipForm").submit(function (e) {
    e.preventDefault();
    formData = {
      acknowledged: true,
      comments: $('textarea[name="comments"]').val(),
    };
    console.log(formData);
    const url = window.location.href;
    axios
      .put(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        Swal.fire("Done !", res.data.message, "success");
      })
      .catch((err) => {
        Swal.fire("Oops...", err, "error").then((res) => {
          location.reload();
        });
      });
  });
});
