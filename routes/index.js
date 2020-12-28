const router = require("express").Router();
const bodyParser = require("body-parser");
const { Db } = require("mongodb");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const DB = require('../DB/DB');
const db = new DB();
//api request to insert one doc to the specified collection
router.post("/db/insertone", db.InsertOne);
// api request to get the list of docs of the specified collection
router.get("/db/itemlist", db.getList);
// api request to get a document from the specified id and collection
router.get("/db/itembyid", db.getItemById)


module.exports = router;