const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
const admin = require('firebase-admin');
var hbs = require('handlebars');

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

var serviceAccount = require('./YOUR_SDK_NAME.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fir-node-1bf4a.firebaseio.com'
});

// admin.initializeApp(functions.config().firebase);

async function getFirestore() {
  const firestore_con = await admin.firestore();
  const writeResult = firestore_con
    .collection('sample')
    .doc('sample_doc')
    .get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        return doc.data();
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  return writeResult;
}

async function getFirestoreM() {
  try {
    let query = await admin.firestore().collection('form_data');
    //   let query = db.collection('items');
    let response = [];
    await query.get().then(querySnapshot => {
      let docs = querySnapshot.docs;
      for (let doc of docs) {
        const selectedItem = {
          id: doc.id,
          firstname: doc.data().firstname,
          lastname: doc.data().lastname
        };
        response.push(selectedItem);
      }
    });
    return response;
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

async function insertFormData(request) {
  const writeResult = await admin
    .firestore()
    .collection('form_data')
    .doc()
    .create({
      firstname: request.body.firstname,
      lastname: request.body.lastname
    })
    .then(function() {
      console.log('Document successfully written!');
    })
    .catch(function(error) {
      console.error('Error writing document: ', error);
    });
}

app.get('/', async (request, response) => {
  var db_result = await getFirestore();
  response.render('index', { db_result });
  //   response.send(db_result);
});

app.get('/ping', async (request, response) => {
  var db_result = await getFirestore();
  // response.render('index', { db_result });

  response.send(db_result);
});

app.get('/ping1', async (request, response) => {
  var db_result = await getFirestoreM();
  // response.render('index', { db_result });
  response.send(db_result);
});

app.post('/insert_data', async (request, response) => {
  var insert = await insertFormData(request);
  response.sendStatus(200);
});
exports.app = functions.https.onRequest(app);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
