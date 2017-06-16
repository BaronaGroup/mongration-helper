"use strict"
var through = require('through')

// The node module stringify is supposed to do this, but for some reason it does not work with R2, so here is
// something that does

module.exports = function(matcher) {
  return function(file) {
    var data = ''
    return through(write, end)

    function write(buf) { data += buf }

    function end() {

      if (matcher.test(file)) {
        var output = 'module.exports = ' + convertStringToJavascriptCodeString(data)
        this.queue(output)
      } else {
        this.queue(data)
      }
      this.queue(null)
    }
  }
}

function convertStringToJavascriptCodeString(data) {
  var replacements = {
    '\\': '\\\\',
    '"': '\\"'
  }
  var sanitizedDataLines = data.split(/\r?\n/)
    .map(function(line) {
      var sanitizedLine = line.replace(/(\\|")/g, function(match) {
        return replacements[match]
      })
      return '"' + sanitizedLine + '\\n"'
    })
  var jsString = sanitizedDataLines.join('\n + ')
  return jsString
}