$(document).ready(function () {
  $("#forgotPassword").submit(function (e) {
    e.preventDefault();
    formData = {
      email: $('input[name="email"]').val(),
    };
    console.log(formData);
    const url = window.location.href;
    axios
      .post(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        Swal.fire("Done !", res.data.message, "success");
      })
      .catch((err) => {
        Swal.fire("Oops...", err, "error");
      });
  });
});
