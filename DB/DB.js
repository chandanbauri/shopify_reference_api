const MongoCLient = require("mongodb").MongoClient;
const mongoURL = process.env.mongo_URL;
const dbName = "test";
const mongoPromises = {
    useUnifiedTopology: true
};
const ObjectID = require('mongodb').ObjectID;


/*------------------------------------------------------- making connection to the DB ---------------------------------------------------------- */
class DB {


    createCollection = (req, res, next) => {
        MongoCLient.connect(mongoURL, mongoPromises, (err, client) => {
            if (err) {
                throw err;
            };
            console.log("connected to MongoDB!!!");



            let db = client.db(dbName);
            db.listCollections({ name: 'product' })
                .next((err, collection) => {
                    console.log(collection);
                });

        });
    };

    /* method for inserting a document */

    InsertOne = (req, res, next) => {
        const { collectionName, name } = req.body;
        const document = { name: name };
        if (collectionName !== null && typeof collectionName == 'string') {
            MongoCLient.connect(mongoURL, mongoPromises, async (err, client) => {
                if (err) {
                    req.status = { success: false, message: 'there is some issue on the server' }; // if some internal error occurs
                    throw err;
                };

                let db = client.db(dbName);

                db.listCollections({ name: collectionName }, { nameOnly: true })
                    .next(async (err, collection) => {
                        if (err) throw err;

                        await db.collection(collectionName).findOne({ name: document.name }) // checking if the product already exists
                            .then(async (findValue) => {
                                if (findValue) {
                                    req.status = { success: false, message: " Product Already exist! " }; // if product already exists 
                                } else {
                                    if (document.name == null) {
                                        req.status = { success: false, message: " Please enter a valid product name! " };
                                    }
                                    else {
                                        await db.collection(collectionName).insertOne(document)
                                            .then((response) => {
                                                //console.log(response.insertedCount);
                                                req.status = { success: true, message: " Product Added successfully! " }; // if insetion is successful
                                            })
                                            .finally(() => {
                                                client.close();
                                                next()
                                            })
                                            .catch((err) => {
                                                console.log(err);
                                                req.status = { success: false, message: 'there is some issue on the server' }; // if some internal error occurs
                                            })
                                    }
                                }
                            })
                            .finally(() => {
                                client.close();
                                next();
                            })
                            .catch((err) => {
                                console.log(err);
                                req.status = { success: false, message: 'there is some issue on the server' }; // if some internal error occurs
                            })




                    })
            });
        }
        else {
            req.status = { success: false, message: 'Invalid Colleaction Name' };
        }
    };

    getList = async (req, res, next) => {
        const { collectionaName } = req.body
        if (collectionaName !== null && typeof collectionaName == 'string') {
            MongoCLient.connect(mongoURL, mongoPromises, async (err, client) => {
                if (err) {
                    req.status = { success: false, message: 'there is some issue on the server' }; // if some internal error occurs
                    throw err;
                }
                let db = client.db(dbName);

                await db.collection(collectionaName).find({}).toArray()
                    .then((response) => {
                        if (response.length == 0) {
                            req.status = { success: false, message: 'no Document Found' }; // if some internal error occurs
                        } else {
                            console.log(response);
                            req.status = { success: true, [`${collectionaName}_list`]: response }; // if some internal error occurs
                        }
                    })
                    .finally(() => {

                        client.close();
                        next();

                    })
                    .catch((err) => {
                        req.status = { success: false, message: 'there is some issue on the server' }; // if some internal error occurs
                        throw err;
                    });

            });
        }
        else {
            req.status = { success: false, message: 'Invalid Collection Name' }; // if some internal error occurs
        }
    }
    // api for getting a item details for the specified id and collection name
    getItemById = async (req, res, next) => {
        const { collectionName } = req.body;
        const { id } = req.query;
        console.log(collectionName);
        if (collectionName != null && typeof collectionName == 'string') {
            MongoCLient
                .connect(mongoURL, mongoPromises, async (error, client) => {   // connecting to mongo db 
                    if (error) {
                        res
                            .status(500)
                            .send({
                                success: false,
                                message: "some internal error has occured."
                            });    // if error occurs then send error response 
                    } else {
                        const db = client.db(dbName);
                        await db.listCollections({ name: collectionName })   // checking if the specified colledction does exist or not 
                            .next(async (err, collection) => {
                                if (err) {
                                    res
                                        .status(500)
                                        .send({
                                            success: false,
                                            message: "some internal error has occured."
                                        });  // if error occurs then send error response 
                                    throw err;
                                } else {
                                    if (collection) {     // specified collection exists 
                                        await db.collection(collectionName).findOne({ _id: ObjectID(id) })  // trying to find
                                            .then((result) => {                                             //  the specified document 
                                                if (result) {    // if document exist 
                                                    res
                                                        .status(200)
                                                        .send({
                                                            success: true,
                                                            [`${collectionName}_details.`]: result
                                                        });   // send document to the user
                                                } else {
                                                    res
                                                        .status(404)
                                                        .send({
                                                            success: false,
                                                            message: `${collectionName} not found. `
                                                        });   // if document is not found send error response 
                                                }
                                            })
                                            .finally(() => {
                                                db.close();  // close db connection  
                                                next();   // if any 
                                            })
                                            .catch((err) => {
                                                if (err) {
                                                    res
                                                        .status(500)
                                                        .send({
                                                            success: false,
                                                            message: "some internal error has occured."
                                                        });  // if any error occurs then send status 
                                                }            // code 500 followed by the above message 
                                            })
                                    } else {
                                        res
                                            .status(404)
                                            .send({
                                                success: false,
                                                message: `collection ${collectionName} not found.`
                                            }); // if the specified collection name does not exist 
                                    }
                                }
                            })
                    }
                })






        } else {
            res
                .status(500)
                .send({
                    success: false,
                    message: "enter a valid collection name."
                }); // if collection name is not a string or a null value
        }
    };


    




}
/* ----------------------------------------------------------------------------------------------------------------------------------------------------- */


module.exports = DB;