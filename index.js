const lessons = require("./lessons.json")

// const { NlpManager } = require("node-nlp")

// const manager = new NlpManager({ languages: ["en"] })
// //
// lessons.forEach(lesson => {
//   try {
//     manager.addDocument("en", lesson.title, "greetings.hello")
//   } catch (error) {
//     console.log({ error: lesson.title })
//   }
// })
// ;(async () => {
//   await manager.train()
//   manager.save()
//   const response = await manager.process("en", "Should I Learn Angular")
//   console.log(response)
// })()

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

const titlesObject = sentences
  // .slice(0, 10)
  .map(sentence => sentence.map(word => `#${word.tag}#`).join(" "))
  .reduce((acc, sentence, i) => {
    acc["title" + i] = sentence
    return acc
  }, {})

console.log(Object.keys(titlesObject))

const _ = require("lodash")
const words = _.flatten(sentences)

const tagsObject = words.reduce((acc, word) => {
  if (acc[word.tag]) acc[word.tag].push(word.token)
  else acc[word.tag] = [word.token]

  return acc
}, {})

console.log(tagsObject)

const bracery = require("bracery")
const b = new bracery.Bracery({
  ...tagsObject,
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
