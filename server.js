const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const YAML = require('yaml');
const cors = require('cors');

// Read Swagger file
const swaggerFile = fs.readFileSync('./swagger.yaml', 'utf8');
const swaggerDocument = YAML.parse(swaggerFile);

const app = express();
app.use(cors());
app.use(express.json());

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Example route (can connect to Flask API)
app.get('/health', (req, res) => {
  res.send('Server is running!');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
