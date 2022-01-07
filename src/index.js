/// importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');

const { Ad } = require('../models/ad');
const { User } = require('../models/user');
mongoose.connect('mongodb+srv://admin:uQfTlXrdt0XkZvH9@cluster0.3ypd2.mongodb.net/adverts?retryWrites=true&w=majority');
const port = process.env.PORT || 3001
// defining the Express app
const app = express();
const defaultSort = {date: 1}

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));


app.post('/auth', async (req,res) => {
  const user = await User.findOne({ username: req.body.username })
  console.log(req.body)
  if(!user) {
    return res.sendStatus(401);
  }
  if( req.body.password !== user.password ){
    return res.sendStatus(403)
  }

  user.token = uuidv4()
  await user.save()
  res.send({token: user.token})

})

app.use( async (req,res,next) => {
  const authHeader = req.headers['authorization']
  const user = await User.findOne({token: authHeader})
  if(user) {
    next()
  }else {
    res.sendStatus(403);
  }
})


// defining CRUD operations
app.get('/', async (req, res) => {
  res.send(await Ad.find().sort(defaultSort).lean());
});

app.post('/', async (req, res) => {
  const newAd = req.body;
  const ad = new Ad(newAd);
  await ad.save();
  res.send({ message: 'New ad inserted.' });
});

app.delete('/:id', async (req, res) => {
  await Ad.deleteOne({ _id: ObjectId(req.params.id) })
  res.send({ message: 'Ad removed.' });
});

app.put('/:id', async (req, res) => {
  await Ad.findOneAndUpdate({ _id: ObjectId(req.params.id)}, req.body )
  res.send({ message: 'Ad updated.' });
});

app.get('/events/:location', async (req, res) => {
  const result = await Ad.find({ location: req.params.location} ).lean()
  res.send(result);
})

app.post('/events/search', async (req, res) => {
  const { sLocation, sEvent, dateMin, dateMax } = req.body
  const query = {}
  if (sEvent) {
    query.event = sEvent
  }
  if (sLocation){
    query.location = sLocation
  }
  if (dateMin){
    query.date = { $gte: dateMin }
  }
  if (dateMax) {
  query.date.$lte = dateMax
  }
  if (!dateMax && dateMin){
    query.date={$eq:dateMin}
  }
  res.send(await Ad.find(query).sort(defaultSort).lean())
})

// starting the server
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log("Database connected!")
});
