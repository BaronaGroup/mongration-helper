var maxTop = 0

setInterval(function() {
  var body = document.querySelector('body')
  if (!body) return
  var currentTop = body.scrollTop
  var scrolled = currentTop < maxTop
  console.log(scrolled)
  body.scrollTop = 9e8
  if (body.scrollTop > maxTop) {
    maxTop = body.scrollTop
  }
  if (scrolled) {
    body.scrollTop = currentTop
  }

}, 150)
