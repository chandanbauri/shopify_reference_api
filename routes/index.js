const router = require("express").Router();
const bodyParser = require("body-parser");
const { Db } = require("mongodb");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const DB = require('../DB/DB');
const db = new DB();
//api request to insert one doc to the specified collection
router.post("/db/insertone", db.InsertOne, async (req, res) => {



    if (req.status.success) {
        res.send(req.status);
    } else {
        res.send(req.status);
    }


});

// api request to get the list of docs of the specified collection
router.get("/db/itemlist", db.getList, async (req, res) => {

    if (req.status.success) {
        res.send(req.status);
    } else {
        res.send(req.status);
    }
});

router.get("/db/itembyid", db.getItemById)


module.exports = router;