const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

//-------------------------------------------------------------------------
// Setup
//-------------------------------------------------------------------------
const app = express();
app.use(bodyParser.json());

//-------------------------------------------------------------------------
// Identity provider related endpoints
//-------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
const IDENTITY_PROVIDER_SERVICE_HOST = process.env.IDENTITY_PROVIDER_SERVICE_HOST_ENVV || "http://identity_provider_service"
const IDENTITY_PROVIDER_SERVICE_PORT = process.env.IDNTITY_PROVIDER_SERVICE_PORT_ENVV || 6000;
const REGISTER_ROUTE = process.env.REGISTER_ROUTE_ENVV || "register";
const AUTHN_ROUTE = process.env.AUTHN_ROUTE_ENVV || "authN";
const AUTHZ_ROUTE = process.env.AUTHZ_ROUTE_ENVV || "authZ";

async function isAuthorized(authHeader) {
  try {
    const authZResult = await axios.get(IDENTITY_PROVIDER_SERVICE_HOST + ':' + IDENTITY_PROVIDER_SERVICE_PORT + '/' + AUTHZ_ROUTE, {
      headers: { Authorization: authHeader }
    });
    return authZResult.data.message === "Authorized";
  }
  catch (error) {
    throw error
  }
}

//register
app.post('/api/v1/' + REGISTER_ROUTE, async (req, res) => {
  try {
    const registerResult = await axios.post(IDENTITY_PROVIDER_SERVICE_HOST + ':' + IDENTITY_PROVIDER_SERVICE_PORT + '/' + REGISTER_ROUTE, req.body);
    res.json(registerResult.data);
  } catch (error) {
    res.status(error.response.status).json(error.response.data);
  }
});

//login
app.post('/api/v1/' + AUTHN_ROUTE, async (req, res) => {
  try {
    const authNResult = await axios.post(IDENTITY_PROVIDER_SERVICE_HOST + ':' + IDENTITY_PROVIDER_SERVICE_PORT + '/' + AUTHN_ROUTE, req.body);
    res.json(authNResult.data);
  } catch (error) {
    res.status(error.response.status).json(error.response.data);
  }
});

//-------------------------------------------------------------------------
// Quiz service related endpoints
//-------------------------------------------------------------------------
app.get('/api/v1/browse-quizzes', (req, res) => {
  if (!isAuthorized(req.headers.authorization)) res.json({ message: "Not authorized!" });
  //retreive quizzes
  res.json({ message: "Quizzes retreived!" });

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
// Notifier service && Quiz service related endpoints
//-------------------------------------------------------------------------
app.post('/api/v1/send-quiz-link', (req, res) => {
  // Implement logic to send a link to a quiz to given emails here
});

app.post('/api/v1/send-results', (req, res) => {
  // Implement logic to send quiz results to HR email here
});

//-------------------------------------------------------------------------
// Start server
//-------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
