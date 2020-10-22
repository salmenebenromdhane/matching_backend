var express = require('express');
var router = express.Router();


router.get('/getAllCompanies', function (req, res, next) {
    var db = req.db;
    db.all("select * from companies  ", (err, data) => {
        if (err) throw err;
       res.send(data)
    });
});

router.get('/getCompanyById/:id', function (req, res, next) {
    var db = req.db;
    db.all("select * from companies where id="+req.params.id, (err, data) => {
        if (err) throw err;
       res.send(data)
    });
});

router.get('/getMatchingCompaniesByCompany/:id', function (req, res, next) {
    var db = req.db;
    db.all("select * from companies where source_id="+req.params.id     , (err, data) => {
        if (err) throw err;
        db.all("select * from companies where source_name='dataset_B.csv' and name='"+data[0].name+"'",(err,data)=>{
        if(err) throw err;  
        res.send(data)
       })
    });
});


router.get('/invalidMatch/:id', function (req, res, next) {
    var db = req.db;
    db.run("update matching set valid='false' where id="+req.params.id,(err,data)=>{
     if(err) throw err;
      db.all("select * from matching where id="+req.params.id     , (err, data) => {
        if (err) throw err;
         res.send(data)
            });
    });
});




module.exports = router;
