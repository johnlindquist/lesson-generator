const { tags, titles } = require('./data.json')

const bracery = require('bracery')

const b = new bracery.Bracery({
  ...tags,
  ...titles
})

const title = require('title')

const keysLength = Object.keys(titles).length

const randomTitle = Object.keys(titles)[Math.floor(Math.random() * keysLength)]

const text = title(b.expand(`#${randomTitle}#`).text)
document.querySelector('#lesson').innerHTML = text
document.querySelector(
  'section'
).innerHTML += `<div class='glitch-window'><h2 id="lesson">${text}</h2></div>`
