const paul = require('../paul')
const { stringIncludes, arrayIncludes } = require('../utils')
const { voidTags } = require('../constants')
const { serializeAttr, dasherize, inlineStyle } = require('./utils')

const newline = '\n'
const jadeDefaults = {
  indentation: '  '
}

function isWhitespaceNode (node) {
  return !(node.type === 'Text' && !node.content.trim())
}

function toJade (tree, options = jadeDefaults) {
  let { doctype } = options
  const multi = multilineText(options.indentation)

  if (tree.filter) tree = tree.filter(isWhitespaceNode)
  const jade = paul.walk(tree, (node, walk, depth) => {
    const { type, tagName, attributes } = node
    if (type === 'Text') {
      return multi(node.content, depth, '| ')
    }
    if (type === 'Comment') {
      const text = node.content
      return ~text.indexOf(newline)
        ? multi('//', depth) + newline + multi(text, depth + 1)
        : multi('//' + text, depth)
    }
    let tag = tagName
    const { id, className } = attributes
    if (id) tag += `#${id}`
    if (className) tag += `.${className.join('.')}`

    const redundantDiv = node.tagName === 'div' && tag.length > 3
    if (redundantDiv) tag = tag.slice(3)

    tag = multi(tag, depth)
    const attrs = node.attributes
    const props = Object.keys(attrs).filter(key => {
      return key !== 'className' && key !== 'id'
    })
    if (props.length) {
      const isXml = doctype === 'xml'
      tag += '('
      tag += props.map(prop => {
        const val = attrs[prop]
        if (prop === 'dataset') {
          return Object.keys(val).map(attr => {
            return serializeAttr('data-' + dasherize(attr), val[attr], isXml)
          }).join(', ')
        }
        if (prop === 'style') return serializeAttr(prop, inlineStyle(val))
        return serializeAttr(dasherize(prop), val, isXml)
      }).join(', ')
      tag += ')'
    }
    const lowTagName = node.tagName.toLowerCase()
    if (arrayIncludes(voidTags, lowTagName)) {
      if (lowTagName === '!doctype') {
        if (!doctype) doctype = doctypeShortcut(tag)
        return multi('doctype ' + doctype, depth)
      }
      return tag
    }

    const { children } = node
    if (!children.length) return tag
    if (children.length === 1 && children[0].type === 'Text') {
      const text = children[0].content
      return ~text.indexOf(newline)
        ? tag + '.' + newline + multi(text, depth + 1)
        : tag + ' ' + text
    }

    return tag + newline +
      walk(children.filter(isWhitespaceNode), depth + 1).join(newline)
  }, 0)
  if (jade.join) return jade.join(newline)
  return jade
}

function multilineText (indentation) {
  let format = line => line
  const hasTab = stringIncludes(indentation, '\t')
  if (hasTab) {
    format = line => line.replace(/\t/g, indentation)
  }

  function indent (depth, str) {
    while (depth--) {
      str = indentation + str
    }
    return str
  }

  return function (str, depth, lead = '') {
    const lines = str
      .split(newline)
      .map(format)
      .filter(line => !!line.trim())

    const start = maxSharedIndent(lines)
    return lines
      .map(line => indent(depth, lead + line.slice(start)))
      .join(newline)
  }
}

function maxSharedIndent (lines) {
  return lines.reduce(function (num, line) {
    return Math.min(num, line.length - line.trimLeft().length)
  }, Infinity)
}

// see http://jade-lang.com/reference/doctype/
function doctypeShortcut (str) {
  if (stringIncludes(str, 'Transitional')) return 'transitional'
  if (stringIncludes(str, 'strict')) return 'strict'
  if (stringIncludes(str, 'Frameset')) return 'frameset'
  if (stringIncludes(str, 'Basic')) return 'basic'
  if (stringIncludes(str, '1.1')) return '1.1'
  if (stringIncludes(str, 'Mobile')) return 'mobile'
  return 'html'
}

module.exports = toJade