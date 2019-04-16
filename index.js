const bracery = require("bracery")
const b = new bracery.Bracery(require("./data.json"))

const title = require("title")

const keysLength = Object.keys(titlesObject).length

module.exports = (req, res) => {
  const randomTitle = Object.keys(titlesObject)[
    Math.floor(Math.random() * keysLength)
  ]

  const text = title(b.expand(`#${randomTitle}#`).text)

  res.end(text)
}
