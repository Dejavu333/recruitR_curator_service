const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const cors = require('cors');

//-------------------------------------------------------------------------
// setup
//-------------------------------------------------------------------------
//curator_service
const PORT = process.env.PORT || 5000;
const REGISTER_ROUTE = process.env.REGISTER_ROUTE_ENVV || "register";
const AUTHN_ROUTE = process.env.AUTHN_ROUTE_ENVV || "authN";
const AUTHZ_ROUTE = process.env.AUTHZ_ROUTE_ENVV || "authZ";
//identity_provider_service
const IDENTITY_PROVIDER_SERVICE_HOST = process.env.IDENTITY_PROVIDER_SERVICE_HOST_ENVV || "http://localhost"
const IDENTITY_PROVIDER_SERVICE_PORT = process.env.IDNTITY_PROVIDER_SERVICE_PORT_ENVV || 6000;

// webapp
const app = express();

// CORS
app.use(cors()); // allow requests from any origin // todo restrict it to known domains/origins

// openApi spec
app.use(bodyParser.json());
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'curator API',
      version: '0.1.0',
    },
    servers: [{
      url: 'http://host.docker.internal:' + PORT, // if debug and windows OS, use http://host.docker.internal to reach host machine
    }],
  },
  apis: ['./main.js'], // point to the file where JSDoc comments are written.
};
const specs = swaggerJsdoc(options);
fs.writeFileSync('./OAS.json', JSON.stringify(specs, null, 2));

//-------------------------------------------------------------------------
// identity provider service related endpoints
//-------------------------------------------------------------------------
/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration successful
 *       400:
 *         description: Bad request
 */
app.post(`/api/v1/${REGISTER_ROUTE}`, async (req, res) => {
  // if (!req.body.email|| !req.body.password) {
  //   res.status(400).json({ message: "Bad request!" });
  //   return;
  // }
  try {
    const registerResult = await axios.post(IDENTITY_PROVIDER_SERVICE_HOST + ':' + IDENTITY_PROVIDER_SERVICE_PORT + `/api/v1/${REGISTER_ROUTE}`, req.body);
    res.json(registerResult.data);
  } catch (error) {
    res.status(error.response.status).json(error.response.data);
  }
});

/**
 * @swagger
 * /api/v1/authN:
 *   post:
 *     summary: Authenticate a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful
 *       400:
 *         description: Bad request
 */
app.post(`/api/v1/${AUTHN_ROUTE}`, async (req, res) => {
  // if (!req.body.email || !req.body.password) {
  //   res.status(400).json({ message: "Bad request!" });
  //   return;
  // }
  try {
    const authNResult = await axios.post(IDENTITY_PROVIDER_SERVICE_HOST + ':' + IDENTITY_PROVIDER_SERVICE_PORT + `/api/v1/${AUTHN_ROUTE}`, req.body);
    res.json(authNResult.data);
  } catch (error) {
    res.status(error.response.status).json(error.response.data);
  }
});

//-------------------------------------------------------------------------
// quiz service related endpoints
//-------------------------------------------------------------------------
/**
 * @swagger
 * /api/v1/browse-quizzes:
 *   get:
 *     summary: Browse available quizzes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authorized
 */
app.get('/api/v1/browse-quizzes', async (req, res) => {
  if (! await isAuthorized(req)) res.json({ message: "Not authorized!" });
  //retreive quizzes
  else res.json({ message: "Quizzes retreived!" });

});

app.post('/api/v1/create-quiz', (req, res) => {
  // Implement logic to create a quiz here
});

app.get('/api/v1/get-quiz-link', (req, res) => {
  // Implement logic to get a link to a quiz based on email, quiz, and expiration date here
});

app.get('/api/v1/get-quiz-stats', (req, res) => {
  // Implement logic to get current stats on quiz instances here
});

//-------------------------------------------------------------------------
// notifier service && quiz service related endpoints
//-------------------------------------------------------------------------
app.post('/api/v1/send-quiz-link', (req, res) => {
  // Implement logic to send a link to a quiz to given emails here
});

app.post('/api/v1/send-results', (req, res) => {
  // Implement logic to send quiz results to HR email here
});

//-------------------------------------------------------------------------
// start server
//-------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//-------------------------------------------------------------------------
// functions
//-------------------------------------------------------------------------
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:          
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT 
 */
async function isAuthorized(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  try {
    const authZResult = await axios.get(IDENTITY_PROVIDER_SERVICE_HOST + ':' + IDENTITY_PROVIDER_SERVICE_PORT + `/api/v1/${AUTHZ_ROUTE}`, {
      headers: { Authorization: authHeader }
    });
    return authZResult.data.message === "Authorized";
  }
  catch (error) {
    console.log(error);
    throw error
  }
}