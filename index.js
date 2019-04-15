const lessons = require("./lessons.json")

const _ = require("lodash")

const natural = require("natural")

const baseFolder = "./node_modules/natural/lib/natural/brill_pos_tagger"
const rulesFile = baseFolder + "/data/English/tr_from_posjs.txt"
const lexiconFile = baseFolder + "/data/English/lexicon_from_posjs.json"
const defaultCategory = "N"

const lexicon = new natural.Lexicon(lexiconFile, defaultCategory)
const rules = new natural.RuleSet(rulesFile)
const tagger = new natural.BrillPOSTagger(lexicon, rules)

const sentences = lessons
  // .slice(0, 100)
  .map(lesson => tagger.tag(lesson.title.split(" ")))
  .map(sentence => {
    return sentence.taggedWords.filter(word => {
      return word.tag && word.tag.match(/^[A-Za-z_][A-Za-z0-9_]*$/) != null
    })
  })

const titleCandidates = sentences
  .filter(sentence => sentence[0].tag.startsWith("V") && sentence.length > 3)
  .map(sentence => sentence.map(word => `#${word.tag}#`).join(" "))

const titleCounts = _.countBy(titleCandidates)

const acceptedTitles = Object.keys(titleCounts).reduce((acc, sentence) => {
  const count = titleCounts[sentence]
  console.log({ count })
  return [...acc, ...(count > 1 ? [sentence] : [])]
}, [])

const titlesObject = acceptedTitles.reduce((acc, sentence, i) => {
  acc["title" + i] = sentence
  return acc
}, {})

// console.log(Object.keys(titlesObject))

const words = _.flatten(sentences)

const tagsObject = words.reduce((acc, word) => {
  if (acc[word.tag]) acc[word.tag].push(word.token)
  else acc[word.tag] = [word.token]

  return acc
}, {})

const uniqTagsObject = Object.keys(tagsObject).reduce((acc, key) => {
  acc[key] = _.uniq(tagsObject[key]).filter(token =>
    token.match(/^[A-Za-z_][A-Za-z0-9_]*$/)
  )

  return acc
}, {})

console.log(uniqTagsObject)

const bracery = require("bracery")
const b = new bracery.Bracery({
  ...uniqTagsObject,
  ...titlesObject
})

const title = require("title")

const keysLength = Object.keys(titlesObject).length

module.exports = (req, res) => {
  const randomTitle = Object.keys(titlesObject)[
    Math.floor(Math.random() * keysLength)
  ]

  const text = title(b.expand(`#${randomTitle}#`).text)

  res.end(text)
}
