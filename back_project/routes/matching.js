var express = require('express');
var router = express.Router();
var fs = require("fs");
var d3 = require("d3");
const converter = require('json-2-csv');


 //divide array into arrays
function chunk(array, size) {
  const chunked_arr = [];
  for (let i = 0; i < array.length; i++) {
    const last = chunked_arr[chunked_arr.length - 1];
    if (!last || last.length === size) {
      chunked_arr.push([array[i]]);
    } else {
      last.push(array[i]);
    }
  }
  return chunked_arr;
}


async function addCompaniesFromDataSetB(db) {
  fs.readFile("../dataset_B.csv", "utf8", function (error, data) {
    data = d3.csvParse(data);

    //divide data into arrays of 999 items
    chunks = chunk(data, 999)
    chunks.forEach(element => {
      let placeholders = element.map(x => '("' + x.source_id + '","' + x.name + '","' + x.website + '","' + x.email + '","' + x.phone + '","' + x.address + '","' + x.postal_code + '","' + x.city + '","' + x.country + '","dataset_B.csv")').join(',');
      let sql = `INSERT INTO companies(source_id,name,website,email,phone,address,postal_code,city,country,source_name) VALUES  ${placeholders} `
      db.run(sql, function (err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Rows inserted ${this.changes}`);
      });
    });
  });


}

async function addCompaniesFromDataSetA(db) {
  fs.readFile("../dataset_A.csv", "utf8", function (error, data) {
    data = d3.csvParse(data);

    //divide data into arrays of 999 items
    chunks = chunk(data, 999)
    chunks.forEach(element => {
      let placeholders = element.map(x => '("' + x.source_id + '","' + x.name + '","' + x.website + '","' + x.email + '","' + x.phone + '","' + x.address + '","' + x.postal_code + '","' + x.city + '","' + x.country + '","dataset_A.csv")').join(',');
      let sql = `INSERT INTO companies(source_id,name,website,email,phone,address,postal_code,city,country,source_name) VALUES  ${placeholders} `
      db.run(sql, function (err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Rows inserted ${this.changes}`);
      });
    });
  });


}

 //get common items between two arrays
function getCommonItems(array1, array2) {
  var common = []; // Initialize array to contain common items

  for (var i = 0; i < array1.length; i++) {

    for (var j = 0; j < array2.length; j++) {

      if (array1[i].name.includes(array2[j].name)) { // If item is present in both arrays
        // Push to common array
        common.push(array1[i])
        common.push(array2[j])
      }

    }

  }

  return common; // Return the common items
}

async function ComputeMatching(db) {

  db.all("select  name,source_id,source_name from companies where source_name='dataset_B.csv' ", (err, data) => {
    if (err) throw err;
    var res1 = data;

    db.all("select  name,source_id,source_name from companies where source_name='dataset_A.csv' ", (err, data) => {
      if (err) throw err;

      var commonItemList = getCommonItems(data, res1);

      var uniqueSet = [...new Set(commonItemList)]
      //console.log(commonItemList);

      var uniquesCompanies = [...uniqueSet];
      var datasetA = []
      var datasetB = []
      uniquesCompanies.forEach(element => {
        if (element.source_name == 'dataset_A.csv') datasetA.push(element)
        else datasetB.push(element)
      });

      var matches = []; // Initialize array to contain common items

      for (var i = 0; i < datasetA.length; i++) {
        let nb = 0;
        for (var j = 0; j < datasetB.length; j++) {

          if (datasetA[i].name == datasetB[j].name) { // If item is present in both arrays
            nb++


          }

        }
        if (nb != 0)
          matches.push({ company_id_datasetA: datasetA[i].source_id, number_matches_datasetB: nb })
      }
      
      commonChunks = chunk(matches, 999);
      commonChunks.forEach(element => {
        let placeholders = element.map(x => '("' + x.company_id_datasetA + '","' + x.number_matches_datasetB + '","true")').join(',');
        let sql = `INSERT INTO Matching(company_id_datasetA , number_matches_datasetB,valid ) VALUES  ${placeholders} `
        db.run(sql, function (err) {
          if (err) {
            return console.error(err.message);
          }
          console.log(`Rows inserted ${this.changes}`);
        });
      });
    })


  })

}





router.get('/dataSetB', function (req, res, next) {
  var db = req.db;
  addCompaniesFromDataSetB(db)
  res.json('dataSet_B added to database')
});

router.get('/dataSetA', function (req, res, next) {
  var db = req.db;
  addCompaniesFromDataSetA(db)
  res.json('dataSet_A added to database')
});


router.get('/AddComputedMatchingToTableMatching', function (req, res, next) {
  var db = req.db;
  ComputeMatching(db);
  res.send('Common companies added')
});



router.get('/GenerateMatchingCSV', function (req, res, next) {
  var db = req.db;
  db.all("select * from matching  ", (err, data) => {
    if (err) throw err;
    //convert json to csv
    converter.json2csv(data, (err, csv) => {
      if (err) {
        throw err;
      }
      // write CSV to a file
      fs.writeFileSync('Matching.csv', csv);

    });
    res.send(data)
  })
});
 




module.exports = router;
