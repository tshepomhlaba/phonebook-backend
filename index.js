const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.json())
app.use(morgan("tiny"))
morgan.token("req-body", (req) => {
    if(req.method === "POST") {
        return JSON.stringify(req.body)
    }
    return "";
})

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :req-body"))
let persons = [
    { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
    },
    { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
    },
    { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
    },
    { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
    }
]

//Method to display how many contacts are in the phonebook and the current time and date
app.get('/', (request, response) => {
    const  date = new Date
    response.send( `<p>Phonebook has info for ${persons.length} people<br>${date}</p>`)
})

//Method for display all the contacts in phonebook
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

//Method to display a single contact in the phonebook
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(note => note.id === id)
    if(person) {
    response.json(person)
    } else {
    console.log("x")
    response.status(404).end()   
    }
})

//Method to display delete a contact from the phonebook
app.delete('/api/persons/:id', (request,response) => {
    const id = request.params.id
    persons = persons.filter(note => note.id !== id)
    response.status(204).end()
})


//Method to get the Generate a new ID    
const generateId = () => {
    const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id)))
    : 0
    return String(maxId + 1)
}

//Method to add a new contact to the phonebook
app.post('/api/persons', (request, response) => {
    const body = request.body
    body.id = generateId()
    if (!body.name) {
        response.status(400).json({ 
        error: 'name missing' 
    })
    }else if (!body.number) {
        response.status(400).json({ 
        error: 'number missing' 
        })
    } 
    const NameExits = persons.find(person => {
        return person.name === body.name
    })

    if (NameExits) {
        response.status(400).json ({
        error:"name must be unique"
        })
    }

    persons = persons.concat(body)
    response.status(201).send(persons)   
})


const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})