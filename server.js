const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const app = express();
const port = 3000;

// Load Swagger specification from YAML file
const swaggerDocument = yaml.load('./swagger.yaml');

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// In-memory data (to simulate database)
let clients = [];
let therapists = [];
let sessions = [];
let messages = [];
let journals = [];

// Helper function to find a client by ID
const findClientById = (id) => clients.find(client => client.id === id);

// Helper function to find a therapist by ID
const findTherapistById = (id) => therapists.find(therapist => therapist.id === id);

// API Endpoint to register a new client
app.post('/api/v1/clients/register', (req, res) => {
    const { name, email, password } = req.body;
    if (clients.find(client => client.email === email)) {
        return res.status(409).json({ error: 'Email already exists' });
    }
    const newClient = { id: String(clients.length + 1), name, email, password };
    clients.push(newClient);
    res.status(201).json(newClient);
});

// API Endpoint to register a new therapist
app.post('/api/v1/therapists/register', (req, res) => {
    const { name, email, password, specialization } = req.body;
    if (therapists.find(therapist => therapist.email === email)) {
        return res.status(409).json({ error: 'Email already exists' });
    }
    const newTherapist = { id: String(therapists.length + 1), name, email, password, specialization };
    therapists.push(newTherapist);
    res.status(201).json(newTherapist);
});

// API Endpoint to add a journal entry for a client
app.post('/api/v1/clients/:clientId/journals', (req, res) => {
    const { clientId } = req.params;
    const client = findClientById(clientId);
    if (!client) {
        return res.status(404).json({ error: 'Client not found' });
    }
    const { emotion, intensity, timestamp } = req.body;
    const journalEntry = { id: String(journals.length + 1), clientId, emotion, intensity, timestamp };
    journals.push(journalEntry);
    res.status(201).json(journalEntry);
});

// API Endpoint to get therapists mapped to a client
app.get('/api/v1/clients/:clientId/therapists', (req, res) => {
    const { clientId } = req.params;
    const client = findClientById(clientId);
    if (!client) {
        return res.status(404).json({ error: 'Client not found' });
    }
    const mappedTherapists = therapists.filter(therapist => therapist.clientId === clientId);
    res.status(200).json(mappedTherapists);
});

// API Endpoint to map a therapist to a client
app.post('/api/v1/clients/:clientId/therapists', (req, res) => {
    const { clientId } = req.params;
    const client = findClientById(clientId);
    const { therapistId } = req.body;
    const therapist = findTherapistById(therapistId);
    if (!client || !therapist) {
        return res.status(404).json({ error: 'Client or therapist not found' });
    }
    if (therapist.clientId) {
        return res.status(409).json({ error: 'Therapist already mapped to client' });
    }
    therapist.clientId = clientId;
    res.status(201).json({ message: 'Therapist mapped successfully' });
});

// API Endpoint to get clients mapped to a therapist
app.get('/api/v1/therapists/:therapistId/clients', (req, res) => {
    const { therapistId } = req.params;
    const therapist = findTherapistById(therapistId);
    if (!therapist) {
        return res.status(404).json({ error: 'Therapist not found' });
    }
    const mappedClients = clients.filter(client => client.id === therapist.clientId);
    res.status(200).json(mappedClients);
});

// API Endpoint to schedule a therapy session
app.post('/api/v1/sessions', (req, res) => {
    const { clientId, therapistId, dateTime } = req.body;
    const client = findClientById(clientId);
    const therapist = findTherapistById(therapistId);
    if (!client || !therapist) {
        return res.status(404).json({ error: 'Client or therapist not found' });
    }
    const session = { id: String(sessions.length + 1), clientId, therapistId, dateTime };
    sessions.push(session);
    res.status(201).json(session);
});

// API Endpoint to send a message
app.post('/api/v1/messages', (req, res) => {
    const { senderId, receiverId, message } = req.body;
    const sender = findClientById(senderId) || findTherapistById(senderId);
    const receiver = findClientById(receiverId) || findTherapistById(receiverId);
    if (!sender || !receiver) {
        return res.status(404).json({ error: 'Sender or receiver not found' });
    }
    const newMessage = { id: String(messages.length + 1), senderId, receiverId, message };
    messages.push(newMessage);
    res.status(201).json(newMessage);
});

// API Endpoint to search across journals and notes
app.get('/api/v1/search', (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Invalid query' });
    }
    const searchResults = [
        ...journals.filter(journal => journal.emotion.includes(query) || journal.timestamp.includes(query)),
        ...messages.filter(message => message.message.includes(query)),
    ];
    res.status(200).json(searchResults);
});

// Start the server
app.listen(port, () => {
    console.log(`Therapy App API is running at http://localhost:${port}`);
});
