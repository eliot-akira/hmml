const { createElement } = require('react')
const html = require('../html')
const decodeEntities = require('../html/entities/decode')

function render(str) {
  const nodes = typeof str==='string' ? html.parse(str) : str
  return renderNodes(nodes)
}

function renderNodes(nodes, context) {
  return nodes.map((node) =>
    node.type==='Element'
      ? renderTag(node.tagName, node.attributes, node.children, context)
      : node.type==='Text'
        ? decodeEntities(node.content)
        : null // HTML Comment
  )
}

function renderTag(tagName, attributes, children, context) {

  // TODO: Registered tags

  return createElement(
    tagName,
    renderAttributes(attributes, { ...context, tagName }),
    renderNodes(children, context)
  )
}

function renderAttributes(attributes, { tagName }) {

  const { keys, ...atts } = attributes

  return atts
}

module.exports = {
  render
}