const { tags, titles } = require("./data.json")

const bracery = require("bracery")

const structures = titles.reduce(
  (acc, title, i) => ({ ...acc, ["title" + i]: title.structure }),
  {}
)

const braceryData = {
  ...tags,
  ...structures
}

console.log(braceryData)

const b = new bracery.Bracery(braceryData)

const title = require("title")

const getRandomObjectValue = object => {
  const keys = Object.keys(object)
  return object[keys[Math.floor(Math.random() * keys.length)]]
}
module.exports = (req, res) => {
  const randomTitle = getRandomObjectValue(structures)

  const t = b.expand(`${randomTitle}`)

  const text = title(t.text)
  console.log(`
    ###
    ${randomTitle}
    ---
    ${titles.find(title => title.structure == randomTitle).originals}
    ${t.text}
    ---
  `)

  res.end(text)
}
