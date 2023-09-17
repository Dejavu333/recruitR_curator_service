const express = require('express');
const { check, validationResult } = require('express-validator');
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
//quiz_service
const QUIZ_SERVICE_HOST = process.env.QUIZ_SERVICE_HOST_ENVV || "http://localhost"
const QUIZ_SERVICE_PORT = process.env.QUIZ_SERVICE_PORT_ENVV || 5100;

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
fs.writeFileSync('./docs/OAS.json', JSON.stringify(specs, null, 2)); //must be ./ for debug

// middleware to validate the request
function createValidationMiddleware(validationChecks) {
  return [
    ...validationChecks,
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ message: errors.array() });
        return;
      }
      next();
    },
  ];
}

const validateQuizRequest =  createValidationMiddleware([
  check('owneremail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),

  check('id')
    .optional()
    .isMongoId()
    .withMessage('Invalid BSON ObjectId'),

  check('title')
    .optional()
    .notEmpty()
    .isLength({ min: 4 })
    .withMessage('Title must not be empty and must be longer than 3 characters'),

  check('overallTimeLimit')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Overall time limit must be a positive integer'),
]);

validateLoginRequest = createValidationMiddleware([
  check('email')
    .isEmail()
    .withMessage('Invalid email format'),

  check('password')
    .notEmpty()
    .withMessage('Password must not be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
]);


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
  // todo syntactic validation
  try {
    const registerResult = await axios.post(IDENTITY_PROVIDER_SERVICE_HOST + ':' + IDENTITY_PROVIDER_SERVICE_PORT + `/api/v1/${REGISTER_ROUTE}`, req.body);
    res.json(registerResult.data);
  } catch (error) {
    res.json(error.code);
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
app.post(`/api/v1/${AUTHN_ROUTE}`, validateLoginRequest, async (req, res) => {
  let authNResult;
  try {
    authNResult = await axios.post(IDENTITY_PROVIDER_SERVICE_HOST + ':' + IDENTITY_PROVIDER_SERVICE_PORT + `/api/v1/${AUTHN_ROUTE}`, req.body);
    res.json(authNResult.data);
  } catch (error) {
    if (error.response!=undefined) {
      res.json({ errcode: error.code, detail: error.response.data.detail});
    } else {
      res.json({ errcode: error.code});
    }
  }
});

//-------------------------------------------------------------------------
// quiz service related endpoints
//-------------------------------------------------------------------------
/**
 * @swagger
 * /api/v1/browse_quizzes:
 *   get:
 *     summary: Browse available quizzes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: The ID of the quiz.
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: The title of the quiz.
 *       - in: query
 *         name: owneremail
 *         schema:
 *           type: string
 *         description: The email of the owner of the quiz.
 *     responses:
 *       200:
 *         description: Quiz(zes) retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       401:
 *         description: Not authorized
 *       404:
 *        description: Quiz(zes) not found
 */
app.get('/api/v1/browse_quizzes', validateQuizRequest, async (req, res) => {
  // if (! await isAuthorized(req)) res.json({ message: "Not authorized!" });

  try {
    const browseQuizzesResult = await axios.get(QUIZ_SERVICE_HOST + ':' + QUIZ_SERVICE_PORT + `/api/v1/browse_quizzes`, { params: req.query });
    res.json(browseQuizzesResult.data);
  } catch (error) {
    res.json(error.code);
  }
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



/**
 * @swagger
 * components:
 *   schemas:
 *     Quiz:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The ID of the quiz.
 *         title:
 *           type: string
 *           description: The title of the quiz.
 *         ownerEmail:
 *           type: string
 *           description: The email of the owner of the quiz.
 *         overallTimeLimit:
 *           type: integer
 *           description: The overall time limit for the quiz in seconds.
 *         quizQuestions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuizQuestion'
 *
 *     QuizQuestion:
 *       type: object
 *       properties:
 *         question:
 *           type: string
 *           description: The quiz question.
 *         choices:
 *           type: array
 *           items:
 *             type: string
 *             description: The choices for the question.
 *         answerInd:
 *           type: integer
 *           description: The index of the correct answer in the choices array.
 */
