const fs = require("fs-extra")

const lessons = require("./lessons.json")

const _ = require("lodash")

const natural = require("natural")

const baseFolder = "./node_modules/natural/lib/natural/brill_pos_tagger"
const rulesFile = baseFolder + "/data/English/tr_from_posjs.txt"
const lexiconFile = baseFolder + "/data/English/lexicon_from_posjs.json"
const defaultCategory = "ZZZ"

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

const filteredSentences = sentences.filter(
  sentence => sentence[0].tag.startsWith("V") && sentence.length > 2
)

const titleCandidates = filteredSentences.map(sentence => ({
  structure: sentence.map(word => `#${word.tag}#`).join(" "),
  original: sentence.map(word => word.token).join(" ")
}))

const titleCounts = titleCandidates.reduce((acc, { original, structure }) => {
  const i = acc.findIndex(title => title.structure === structure)

  if (i > -1) {
    acc[i].count += 1
    acc[i].originals.push(original)
  } else {
    acc.push({
      count: 1,
      structure,
      originals: [original]
    })
  }

  return acc
}, [])

const titles = titleCounts
  .filter(title => title.count > 1)
  .filter(({ originals }) => {
    const arrayOfWords = originals
      .join(" ")
      .split(" ")
      .sort()

    // console.log({ arrayOfWords })

    const result = arrayOfWords.every((word, i, source) => {
      return word != source[++i]
    })

    console.log({ result })

    return result

    // return rest.some(original =>
    //   arrayOfWords.filter(word => original.includes(word))
    // )
  })

// const titles = acceptedTitles.reduce((acc, sentence, i) => {
//   acc["title" + i] = sentence
//   return acc
// }, {})

const words = _.flatten(sentences)

const tagsObject = words.reduce((acc, { tag, token }) => {
  const lowercaseToken = token.toLowerCase()
  if (acc[tag]) acc[tag].push(lowercaseToken)
  else acc[tag] = [lowercaseToken]

  return acc
}, {})

const tags = Object.keys(tagsObject).reduce((acc, key) => {
  acc[key] = _.uniq(tagsObject[key])
    .filter(token => token.match(/^[A-Za-z_][A-Za-z0-9_]*$/))
    .sort()

  return acc
}, {})

;(async () => {
  await fs.writeJSON("./data.json", {
    tags,
    titles
  })
})()
