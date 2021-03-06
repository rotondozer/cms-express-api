'use strict'

const controller = require('lib/wiring/controller')
const models = require('app/models')
const Page = models.page

const authenticate = require('./concerns/authenticate')
const setUser = require('./concerns/set-current-user')
const setModel = require('./concerns/set-mongoose-model')

// All pages from all users
const index = (req, res, next) => {
  Page.find()
    .then(pages => res.json({
      pages: pages.map((e) =>
        e.toJSON({ virtuals: true, user: req.user }))
    }))
    .catch(next)
}

const indexUserPages = (req, res, next) => {
  Page.find({ _owner: req.params.user_id })
    .then(pages => res.json({
      pages: pages.map((e) =>
        e.toJSON({ virtuals: true, user: req.user }))
    }))
    .catch(next)
}

// One page from any user
const show = (req, res) => {
  console.log('params id = ' + req.params.id)
  res.json({
    page: req.page.toJSON({ virtuals: true, user: req.user })
  })
}

// Create 1 page with sections
const create = (req, res, next) => {
  console.log('creating page')
  console.log('request body title ===' + req.body.page.title)
  console.log('user id ===' + req.user._id)
  const page = Object.assign(req.body.page, {
    _owner: req.user._id
  })
  console.log('page === ' + page)
  console.log('page.sections.heading === ' + page.sections.heading)
  Page.create(page)
    .then(page =>
      res.status(201)
        .json({
          page: page.toJSON({ virtuals: true, user: req.user })
        }))
    .catch(next)
}

const update = (req, res, next) => {
  const updatedPageData = req.body.page
  for (const prop in updatedPageData) {
    console.log(updatedPageData[prop])
    if (updatedPageData[prop] === '') {
      delete updatedPageData[prop]
    }
  }
  delete req.body._owner  // disallow owner reassignment.
  req.page.update(updatedPageData)
    .then(() => res.sendStatus(204))
    .catch(next)
}

// 1 page from any user
const destroy = (req, res, next) => {
  req.page.remove()
    .then(() => res.sendStatus(204))
    .catch(next)
}

module.exports = controller({
  index,
  indexUserPages,
  show,
  create,
  update,
  destroy
}, { before: [
  { method: setUser, only: ['index', 'show'] },
  { method: authenticate, except: ['index', 'show'] },
  { method: setModel(Page), only: ['show'] },
  { method: setModel(Page, { forUser: true }), only: ['update', 'destroy'] }
] })
