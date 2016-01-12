/***
 * Create SQL to load data from a CSV file into the Zerolitter MySQL database
 * Useage: node import_csv.js
 * mysql -u root -p < zerolitter-data-inserts.sql
 * Depends on csv2sql-lite Node module... (npm install csv2sql-lite).
 ***/

var CSV2SQL = require('csv2sql-lite');
var csv2sql = CSV2SQL({
  tableName: 'myTableName',
  dbName: 'bagsintrees',
});

var fs = require('fs');
var rstream = fs.createReadStream('./zerolitter-data.csv');
var wstream = fs.createWriteStream('./zerolitter-data-inserts.sql');

rstream.pipe(csv2sql).pipe(wstream);
