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
                        // res.json(result);
                        else{
                            callback(result)
                        }
                        db.close();
                        // console.log(result)
                        // return result;
                    })
            }
        )
    } catch (error) {
        console.log(error)
    }

}

exports.checkUserExist = checkUserExist;