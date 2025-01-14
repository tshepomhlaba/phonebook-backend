const express = require('express')
const app = express()
const morgan = require('morgan')
require('dotenv').config()

const cors = require('cors')
const Person = require('./models/person')

const PORT = process.env.PORT || 3001

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

//Function for logging the different requests to the console
morgan.token('req-body', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :req-body'
  )
)

//Function to get all persons
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      if (persons) {
        response.json(persons)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (request, response,next) => {
  const id = request.params.id
  Person.findById(id)
    .then((persons) => {
      if (persons) {
        response.json(persons)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.get('/info', (request, response) => {
  const date = new Date()
  Person.find({}).then((persons) => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people <br>${date}</p>`
    )
  })
})

//Route to add a new person to the database
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

//Deleting a person from the database
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

//Route to update and already existing person with new infromation
app.put('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end
      }
    })
    .catch((error) => next(error))
})

//Error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
