var express = require('express');
var router = express.Router();
var axios = require("axios");
var mongo = require('mongodb');
var movietrailer = require("movie-trailer");
var MongoClient = mongo.MongoClient;
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const { checkUserExist, getUserDetails } = require('../services/Operations');
require('dotenv').config();

var url = "mongodb://localhost:27017/";
const moviesArray = ["Tenet", "Ad Astra", "Escape Room", "My Spy", "Venom", "Joker", "Avengers", "Aladdin", "Iron Man", "Rush Hour", "Transformers", "Black Panther"];

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ test: "express" })

});

router.post('/signup', function (req, res, next) {

  const data = req.body;

  const callback = (result) => {
    if (result === 0) {
      try {
        MongoClient.connect(url,
          { useUnifiedTopology: true },
          function (err, db) {
            if (err) throw err;
            var dbo = db.db("moviemania");
            var myobj = { name: data.name, email: data.email, pass: bcrypt.hashSync(data.pass, 8) };
            dbo.collection("users").insertOne(myobj, function (err, res) {
              if (err) throw err;
              res.status(200).send({ Code: 200, message: "user registered!" });
              db.close();
            })
          }
        )
      } catch (error) {
        console.log(error)
      }
    } else {
      res.status(403).send({ Code: 403, message: "user exist!" });
    }
  };

  checkUserExist(data.email, callback);

})

router.post('/login', function (req, res, next) {

  const data = req.body;
  const hashedPassword = bcrypt.hashSync(data.pass, 8);

  try {
    MongoClient.connect(url,
      { useUnifiedTopology: true },
      function (err, db) {
        if (err) throw err;
        var dbo = db.db("moviemania");
        dbo.collection("users").findOne({ email: data.email }, function (err, result) {
          if (err) throw err;

          else {
            try {
              if (result.email === req.body.email && bcrypt.compare(hashedPassword)) {

                // create a token
                var token = jwt.sign({ id: req.body.email }, process.env.SECRET_JWT_KEY, {
                  expiresIn: 3600 * 1000 // expires in 1 Hour
                });
                res.status(200).send({ Code: 200, auth: true, AuthToken: token, success: true, maxAge: 3600 * 1000, name: result.name, email: result.email });
              } else {
                res.status(401).send({ Code: 401, message: "Credentials Incorrect!" });
              }
            } catch (error) {
              res.status(401).send({ Code: 401, message: "Credentials Incorrect!" });
            }

          }

          db.close();
        })
      }
    )
  } catch (error) {
    console.log(error)
  }

})

router.post('/logout', function (req, res, next) {

  const token = req.body.token;
  const email = req.body.email;

  console.log(req.body)

  try {
    var verificationJWT = jwt.verify(token, process.env.SECRET_JWT_KEY);

    console.log(verificationJWT)

    if (email === verificationJWT.id) {
      // jwt.destroy(verificationJWT.id);
      res.clearCookie('AuthToken');
      res.status(200).send({ auth: false, success: true });
    } else {
      res.status(401).send({ auth: false, success: false });
    }

  } catch (error) {
    console.log(error)
    res.status(401).send({ auth: false, success: false });
  }

})

router.get('/movies', function (req, res, next) {

  let data = [];
  let index = 0;


  try {

    moviesArray.map((elm) => {

      let trailer = "";

      // console.log(elm)

      movietrailer(elm)
        .then(response2 => {
          trailer = response2;
        })
        .catch(console.error)

      var options = {
        method: 'GET',
        url: 'https://imdb-internet-movie-database-unofficial.p.rapidapi.com/film/' + elm,
        headers: {
          
          'x-rapidapi-key': process.env.SECRET_API_KEY,
          'x-rapidapi-host': process.env.SECRET_HOST
        }
      };

      axios.request(options)
        .then(function (response) {
          // console.log("Index:"+index)
          console.log({ title: response.data.title }, index);
          // data.push({title : response.data.title});

          data.push({
            title: response.data.title,
            year: response.data.year,
            poster: response.data.poster,
            desc: response.data.plot,
            trailer: trailer
          });

          if (index === 11) {
            console.log(data.length)
            res.json(data);
          }

          index++;

        }).catch(function (error) {
          console.error(error);
        });

    })

    // //sending back data to frontend
    // return new Promise((resolve) => {
    //   setTimeout(() => resolve(), 12000);

    // })

  } catch (error) {
    console.error(error);
  }

});

router.post('/book', function (req, res, next) {

  const token = req.body.token;
  const email = req.body.email;
  const movieName = req.body.movieName;
  const noOfTickets = req.body.noOfTickets;
  const movieDate = req.body.movieDate;
  const movieShow = req.body.movieShow;


  try {
    var verificationJWT = jwt.verify(token, process.env.SECRET_JWT_KEY);

    //user verification to enter data
    if (email === verificationJWT.id) {

      const callback = (result) => {

        try {
          MongoClient.connect(url,
            { useUnifiedTopology: true },
            function (err, db) {
              if (err) throw err;
              var dbo = db.db("moviemania");
              var myobj = { email: email, custName: result.name, movieName: movieName, noOfTickets: noOfTickets, movieDate: movieDate, movieShow: movieShow };
              dbo.collection("bookings").insertOne(myobj, function (err, process) {
                if (err) throw err;
                if (process.insertedCount > 0) {
                  res.status(200).send({ Code: 200, message: "Booking Completed!" });
                  db.close();
                }else{
                  res.status(500).send({ Code: 500, message: "Internal Server Error!" });
                  db.close();
                }
              })
            }
          )
        } catch (error) {
          console.log(error)
        }

      }
      getUserDetails(email, callback);

    } else {//user not authorized
      res.status(401).send({ auth: false, success: false });
    }

  } catch (error) {
    console.log(error)
    res.status(401).send({ auth: false, success: false });
  }

})

module.exports = router;
