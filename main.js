
const express = require('express');
const bodyParser = require('body-parser');

//-------------------------------------------------------------------------
// Setup
//-------------------------------------------------------------------------
const app = express();
app.use(bodyParser.json());

//-------------------------------------------------------------------------
// Identity provider related endpoints
//-------------------------------------------------------------------------
app.post('/register', (req, res) => {
  // Implement user registration logic here
});

app.post('/login', (req, res) => {
  // Implement user login logic here
});

//-------------------------------------------------------------------------
// Quiz service related endpoints
//-------------------------------------------------------------------------
app.get('/browse-quizzes', (req, res) => {
  // Implement logic to browse quizzes here
});

app.post('/create-quiz', (req, res) => {
  // Implement logic to create a quiz here
});

app.get('/get-quiz-link', (req, res) => {
  // Implement logic to get a link to a quiz based on email, quiz, and expiration date here
});

app.get('/get-quiz-stats', (req, res) => {
  // Implement logic to get current stats on quiz instances here
});

//-------------------------------------------------------------------------
// Notifier service && Quiz service related endpoints
//-------------------------------------------------------------------------
app.post('/send-quiz-link', (req, res) => {
  // Implement logic to send a link to a quiz to given emails here
});

app.post('/send-results', (req, res) => {
  // Implement logic to send quiz results to HR email here
});

//-------------------------------------------------------------------------
// Start server
//-------------------------------------------------------------------------
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
