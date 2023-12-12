require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const dns = require('dns');
const shortid = require('shortid');
const cors = require('cors')

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const urlDatabase = {};

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



let validateUrl = (req, res, next)=>{
 const { url } = req.body;
 dns.lookup(new URL(url).hostname, (err)=>{
  if(err){
    return res.json({ error: 'invalid url' });
  }
  next();
 })
}

// In-memory storage for short URLs


// POST endpoint to create a short URL
app.post('/api/shorturl', validateUrl, (req, res) => {
  const { url } = req.body;
  // Generate a short ID for the URL
  const shortUrl = shortid.generate();

  // Store the mapping in the in-memory database
  urlDatabase[shortUrl] = new URL(url).origin;

  // Return the original and short URL in the response
  res.json({ original_url: urlDatabase[shortUrl], short_url: shortUrl });
});

// GET endpoint to redirect to the original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;

  // Check if the short URL exists in the database
  if (!urlDatabase.hasOwnProperty(short_url)) {
    return res.json({ error: 'invalid url' });
  }

  // Redirect to the original URL
  const originalUrl = urlDatabase[short_url];
  res.redirect(originalUrl);
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

