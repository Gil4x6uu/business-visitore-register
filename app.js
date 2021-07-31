require('dotenv').config()
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || '3000';
const cors = require('cors');


app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const google = require('googleapis').google;
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2();

const jwt = require('jsonwebtoken');
const privateKey = "I love Ela and Berry"


const SSE = require('express-sse');
const sse = new SSE();

let googleUserData;
let db;

client.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    db = client.db("stores");
});


function getAllStores() {
    const collection = client.db("stores").collection('storesDeatails');
    // Find some documents
    collection.find({}).toArray(function (err, docs) {
        assert.equal(err, null);
        console.log("Found the following records");
        console.log(docs)
        return docs;
    });
}

//return the stores
app.get('/getStores', (req, res) => {
    getAllStores()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        })
});

app.get('/getStoresById', (req, res) => {
    getStoreById(req.query.id)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        })
});



app.post('/addVisitorToStore', (req, res) => {
    const storeId = req.body.storeId;
    const visitor = req.body.visitor;
    verifyToken(storeId, req.headers.authorization)
        .then((result) => {
            if (result) {
                addVisitorToStore(visitor, storeId)
                    .then((result) => {
                        getStoreById(result.value.id)
                            .then((result) => {
                                sse.send(result);
                            })
                            .catch((err) => {
                                console.log(err);
                            })
                    })
            }
            else {
                sse.send(result);
                
            }

        })
        res.end();

})

app.post('/addStoreClientToStore', (req, res) => {
    const storeId = req.body.storeId;
    const visitor = req.body.visitor;
    addVisitorToStore(visitor, storeId)
        .then((result) => {
            getStoreById(result.value.id)
                .then((result) => {
                    sse.send(result);
                })
                .catch((err) => {
                    console.log(err);
                })
        })
})

app.post('/updateVisitorToStore', (req, res) => {
    verifyToken(req.body.storeId, req.headers.authorization)
        .then((result) => {
            if (result) {
                const collection = db.collection('storesDeatails');
                collection.updateOne({ id: req.body.storeId },
                    { $set: { [`visitors.${req.body.visitor.id}`]: req.body.visitor } }, (err, message) => {
                        if (message.result.ok === 1) {
                            getStoreById(req.body.storeId)
                                .then((result) => {
                                    res.send(result);
                                })
                                .catch((err) => {
                                    console.log(err);
                                })


                        }
                        else {

                        }

                    })
            }
            else{
                res.send("NO ACESS")
            }
        })

});


app.post('/Login/Savesresponse', (req, res) => {
    const storeOwnersCollection = db.collection('storeOwners');
    const storesDeatailsCollection = db.collection('storesDeatails');
    validateTokenAndGetGoogleUserInfo({ access_token: req.body.authToken })
        .then((googleResult) => {
            if (googleResult.status == 200) {
                const token = jwt.sign({ data: googleResult.data.id }, privateKey, { expiresIn: '1h' });
                storeOwnersCollection.findOne({ id: googleResult.data.id })
                    .then((doc) => {
                        if (!doc) {
                            userDoc = googleResult.data;
                            storesDeatailsCollection.countDocuments({})
                                .then((countResult) => {
                                    userDoc.store_id = countResult + 1;
                                    storeOwnersCollection.insertOne(userDoc);
                                    storeDoc = {};
                                    storeDoc.id = userDoc.store_id;
                                    storeDoc.store_name = `${userDoc.given_name}s store`;
                                    storeDoc.visitorsCount = 0;
                                    storeDoc.visitors = [];
                                    storesDeatailsCollection.insertOne(storeDoc);
                                    res.send([userDoc, storeDoc, token]);
                                })


                        }
                        else {
                            storesDeatailsCollection.findOne({ id: doc.store_id })
                                .then((storeDoc) => {
                                    res.send([doc, storeDoc, token]);
                                });
                        }
                    })
            }
            else {
                console.log("NO ACCESS")
            }
        })
});

app.get('/stream', sse.init);

async function verifyToken(storeId, token) {
    const decodedToken = jwt.verify(token, privateKey);
    const storeOwnersCollection = db.collection('storeOwners');
    return storeOwnersCollection.findOne({ $and: [{ store_id: storeId }, { id: decodedToken.data }] })
}

async function validateTokenAndGetGoogleUserInfo(token) {
    oauth2Client.setCredentials(token);
    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
    });
    return this.googleUserData = oauth2.userinfo.get()

}
async function getStoreById(storeId) {
    const collection = db.collection('storesDeatails');
    return collection.find({ 'id': Number(storeId) }).toArray();
}

async function incrementVisitorsCount(storeId) {
    const collection = db.collection('storesDeatails');
    return collection.findOneAndUpdate({ id: storeId }, { $inc: { visitorsCount: 1 } });
}

async function addVisitorToStore(visitor, storeId) {
    const collection = db.collection('storesDeatails');
    return collection.findOneAndUpdate({ id: storeId }, { $push: { visitors: visitor } });
}

// LISTEN ON PORT
app.listen(port, () =>
    console.log(`API RUNNING ON LOCALHOST: ${port}`)
);
