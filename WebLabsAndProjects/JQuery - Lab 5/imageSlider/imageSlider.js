$(function () {
  var imgs = $(".slider img"), current = 0
  $("#next").click(function () {
    imgs.eq(current).fadeOut(400, function () {
      current = (current + 1) % imgs.length, imgs.eq(current).fadeIn(400)
    })
  })
  $("#prev").click(function () {
    imgs.eq(current).fadeOut(400, function () {
      current = (current - 1 + imgs.length) % imgs.length, imgs.eq(current).fadeIn(400)
    })
  })
})
