var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ test: "express"})
  
});


//  C R (done) U (done)D 
router.get('/readfile', function(req, res, next) {

  console.log(req)
  const fileContent = fs.readFileSync('/home/divya/workspace/stuff/nodejs/express_filecrud/test.txt',{encoding : 'utf8', flag:'r'});
  res.json({ filecontent: fileContent})
});





router.post('/update', function(req, res, next) {

  console.log(req)
  try{
    fs.appendFileSync('/home/divya/workspace/stuff/nodejs/express_filecrud/test.txt', req.body.data.vb.dfg.g, {encoding : 'utf8', flag:'a'});
    res.json({ filecontent: "file read suss=cfuly"})
  } catch(err){
    res.status(500)
    res.json({ filecontent: "file read unsuccefukt"})
  }

});


router.post('/create', function(req, res, next) {

  var createStream = fs.createWriteStream(`/home/divya/workspace/stuff/nodejs/express_filecrud/${req.query.params}.txt`);
  createStream.end(); 
  res.json({ filecontent: "file created succfuly"})
});





router.delete('/delete', function(req, res, next) {

  fs.unlink(`/home/divya/workspace/stuff/nodejs/express_filecrud/${req.query.params}.txt`, (err) => {
    if (err) throw err;
    res.json({ filecontent: 'path/file.txt was deleted'})

  });
});


module.exports = router;
