require('dotenv').config();
const express = require('express');

const app = express()
const port = 

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/twitter', (req, res) => {
    res.send("https://twitter.com/Aakarshit070");
});

app.get('/login', (req, res) => {
    res.send('<h1>Please Login at chai aur code</h1>');
})

app.get('/youtube', (req, res) => {
    res.send("<h1>Chai Aur Code</h1>")
})


app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`)
});