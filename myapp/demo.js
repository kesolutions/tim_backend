const { MongoClient } = require('mongodb')

const client = new MongoClient('mongodb://localhost:27017')

client.connect()
    .then(() => console.log('Connected Successfully'))
    .catch(error => console.log('Failed to connect', error))

