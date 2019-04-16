const { tags, titles } = require("./data.json")

const bracery = require("bracery")

const b = new bracery.Bracery({
  ...tags,
  ...titles
})

const title = require("title")

const keysLength = Object.keys(titles).length

module.exports = (req, res) => {
  const randomTitle = Object.keys(titles)[
    Math.floor(Math.random() * keysLength)
  ]

  const text = title(b.expand(`#${randomTitle}#`).text)

  res.end(text)
}
