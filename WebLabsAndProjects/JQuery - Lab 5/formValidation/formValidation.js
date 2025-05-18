$(function () {
    $("#form").submit(function (e) {
        e.preventDefault()
        var n = $("[name=name]").val().trim(), em = $("[name=email]").val().trim(), p = $("[name=password]").val().trim()
        if (!n || !em || !p) { $(".alert").text("All fields are required").css("color", "red"); return }
        if (em.indexOf("@") === -1 || em.indexOf(".") === -1) { $(".alert").text("Invalid email").css("color", "red"); return }
        $(".alert").text("Success").css("color", "green")
    })
})
