$(function () {
    $("#toggle").change(function () {
        $("#password").prop("type", this.checked ? "text" : "password")
    })
})
