'use strict'

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const PORT = process.env.PORT;
const app = express();
require('ejs');
app.use(cors());
app.use(express.json());
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

app.get('/', renderIndex);
app.get('/weather', weatherHandler);
app.post('/harrypotter', apiHandler);
app.get('/hp-house', houseApiHandler);
app.get('/patronusPage', patronusHandler);

app.use(express.static('./public'));
app.set('view engine', 'ejs');

function renderIndex(req, res) {
  res.status(200).render('./index');
}

let magicNumber;
let sortedHouse = '';

/// PATRONUS HANDLERFUNCTION . 

function patronusHandler(req, res) {
  let url = 'https://gde-patronus.herokuapp.com/';
  console.log(url);
  superagent.get(url)
    .then(data => {
      console.log('this is patronushandler', data);
      res.send(data.body);
    })
    .catch(() => errorHandler('error 500!! something is wrong on the apiHandler function', req, res));

}



function apiHandler(req, res) {
  sortedHouse = req.body.sortedHouse;
  let sortedRivalHouse = req.body.sortedRivalHouse;
  let URL = `https://hp-api.herokuapp.com/api/characters`;
  superagent.get(URL)
    .then(data => {
      let friends = [];
      let foes = [];
      let houseFriends = data.body.filter(houseobj => {
        return houseobj.house === sortedHouse;
      })
      for (let i = 0; i < 1; i++) {
        let myFriends = new Friends(houseFriends[i]);
        friends.push(myFriends);
      }
      let houseFoes = data.body.filter(houseobj => {
        return houseobj.house === sortedRivalHouse;
      })
      for (let i = 0; i < 1; i++) {
        let myFoes = new Foes(houseFoes[i]);
        foes.push(myFoes);
      }
      res.status(200).json({ friends, foes })
    })
    .catch(() => errorHandler('error 500!! something is wrong on the apiHandler function', req, res));
}

//constructor function for friends and foes

function Friends(data) {
  this.name = data.name;
  this.image = data.image;
}

function Foes(data) {
  this.name = data.name;
  this.house = data.house;
  this.image = data.image;
}

Friends.prototype.render = function () {
  const source = $('#threeFriends').html();
  let template = Handlebars.compile(source);
  return template(this);
}

Foes.prototype.render = function () {
  const source = $('#harry-pot').html();
  let template = Handlebars.compile(source);
  return template(this);
}

// WEATHER CODE
//weather function
function Weather(data) {
  this.icon = data.icon;
  this.summary = data.summary;
}

function weatherHandler(req, res) {
  let weatherURL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/54.939196,-3.929788`;
  superagent.get(weatherURL)
    .then(data => {
      const weatherForecast = new Weather(data.body.currently);
      res.send(weatherForecast);
    })
    .catch((err) => errorHandler(`error 500!! something has wrong on  weatherHandler function, ${err.message}`, req, res));
}

/// MADEAPIHANDLER

function houseApiHandler(req, res) {
  console.log('line 16 ', sortedHouse);
  magicNumber = req.query.total;
  let SQL = `SELECT * FROM houses WHERE house='${sortedHouse}';`;
  console.log('INSIDE HOUSE APIHANDLER');
  client.query(SQL)
    .then(result => {
      console.log('after dot then before if');

      if (result.rows.length > 0 && result.rows[0] === undefined) {
        res.send(result.rows[0]);
        console.log('inside of if');
      } else {
        try {
          console.log('inside of try');
          let madeURL = `https://hp-houses-api.herokuapp.com/`;
          superagent.get(madeURL)
            .then(data => {
              let apiToSQL = `INSERT INTO houses (magicNumber , house) VALUES (${magicNumber},'${sortedHouse}');`;
              client.query(apiToSQL);
              res.send(data.body);

            })
            .catch((err) => errorHandler(`error 500 !! something has wrong on madeApiHandler, ${err.message}`, req, res));
        }
        catch (error) {
          errorHandler('muggle error.', req, res);
        }
      }
    })

}

//helper functions (error catching)

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Server up on port ${PORT}`))
  });
