const path = require('path')
const fs = require('fs')
const through = require('through2')
const hmml = require('../index')

module.exports = function (props = {}) {

  const {
    options = {},
    data = {}
  } = props

  return through.obj(function(file, enc, callback) {

    const filePath = file.path

    let content

    // Already streamed by another transform
    try {
      content = file.contents.toString()
    } catch (e) { /**/ }

    if (!content) {
      try {
        content = fs.readFileSync(filePath, 'utf8')
      } catch (e) { /**/ }
    }

    hmml.render(content, options).then(result => {

      file.contents = new Buffer(result)

      callback(null, file)

    }).catch(err => callback(err))

  })
}
