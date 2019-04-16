const fs = require("fs-extra")

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
  .filter(sentence => sentence[0].tag.startsWith("V") && sentence.length > 2)
  .map(sentence => sentence.map(word => `#${word.tag}#`).join(" "))

const titleCounts = _.countBy(titleCandidates)

const acceptedTitles = Object.keys(titleCounts).reduce((acc, sentence) => {
  const count = titleCounts[sentence]
  return [...acc, ...(count > 1 ? [sentence] : [])]
}, [])

const titlesObject = acceptedTitles.reduce((acc, sentence, i) => {
  acc["title" + i] = sentence
  return acc
}, {})

const words = _.flatten(sentences)

const tagsObject = words.reduce((acc, { tag, token }) => {
  const lowercaseToken = token.toLowerCase()
  if (acc[tag]) acc[tag].push(lowercaseToken)
  else acc[tag] = [lowercaseToken]

  return acc
}, {})

const uniqTagsObject = Object.keys(tagsObject).reduce((acc, key) => {
  acc[key] = _.uniq(tagsObject[key])
    .filter(token => token.match(/^[A-Za-z_][A-Za-z0-9_]*$/))
    .sort()

  return acc
}, {})

;(async () => {
  await fs.writeJSON("./data.json", {
    ...uniqTagsObject,
    ...titlesObject
  })
})()
