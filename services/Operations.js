var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/";

const checkUserExist = (email, callback) => {

    try {
        MongoClient.connect(url,
            { useUnifiedTopology: true },
            function (err, db) {
                if (err) throw err;
                var dbo = db.db("moviemania");
                dbo.collection("users").find({email : email}, { projection: { _id: 0 } })
                    .count(function (err, result) {
                        if (err) throw err;
                        else{
                            callback(result)
                        }
                        db.close();
                    })
            }
        )
    } catch (error) {
        console.log(error)
    }

}

const getUserDetails = (email, callback) => {

    try {
        MongoClient.connect(url,
            { useUnifiedTopology: true },
            function (err, db) {
                if (err) throw err;
                var dbo = db.db("moviemania");
                dbo.collection("users").findOne({email : email}, { projection: { _id: 0 } }, function (err, result) {
                        if (err) throw err;
                        else{
                            callback(result)
                        }
                        db.close();
                    })
            }
        )
    } catch (error) {
        console.log(error)
    }

}

exports.checkUserExist = checkUserExist;
exports.getUserDetails = getUserDetails;