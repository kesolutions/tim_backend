const { MongoClient } = require('mongodb')
const client = new MongoClient('mongodb://localhost:27017')
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/user', userRoutes);

app.use('/api', require('./routes/company'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

client.connect()
    .then(() => console.log('Connected Successfully'))
    .catch(error => console.log('Failed to connect', error))

module.exports = app;