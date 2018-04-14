const paul = require('../paul')
const { stringIncludes, arrayIncludes } = require('../utils')
const { voidTags } = require('../constants')
const { serializeAttr, dasherize, inlineStyle } = require('./utils')

const htmlDefaults = {}

function render(tree, options = htmlDefaults) {

  const { doctype } = options

  const isXml = doctype === 'xml'
  const html = paul.walk(tree, (node, walk) => {

    const { type, tagName, attributes, content } = node

    if (type === 'Text') return content
    if (type === 'Comment') return `<!--${content}-->`


    if (!tagName) {
      console.log('NO TAG NAME', node)
      return ''
    }

    let tag = '<' + tagName
    for (const attr in attributes) {

      const val = attributes[attr]
      if (attr === 'dataset') {
        for (const prop in val) {
          const key = 'data-' + dasherize(prop)
          tag += ' ' + serializeAttr(key, val[prop], isXml)
        }
        continue
      }

      if (attr === 'style') {
        tag += ' ' + serializeAttr(attr, inlineStyle(val))
        continue
      }

      if (attr === 'className') {
        tag += ' ' + serializeAttr('class', val.join(' '))
        continue
      }

      // Attribtues without value - See formats/formatAttributes
      if (attr==='keys') {
        if (val[0]) tag += ' '+(val.join(' '))
        continue
      }

      tag += ' ' + serializeAttr(attr /*dasherize(attr)*/, val, isXml)
    }

    tag += '>'

    const autoClose = !isXml && arrayIncludes(voidTags, tagName.toLowerCase())
    if (autoClose) return tag

    const innerds = walk(node.children || []).join('')

    return tag + innerds + `</${tagName}>`
  })

  if (html.join) return html.join('')
  return html
}

module.exports = render