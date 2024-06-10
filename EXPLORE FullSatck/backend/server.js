 import express from 'express';

const app = express();

//Ye to bad practice hoti hai dont ever do it
app.use(express.static('dist'));

// app.get('/', (req, res) => {
//     res.send('Server is Ready');
// });

// get a list of 5 jokes

app.get('/api/jokes', (req, res) => {
    const jokes = [
        {
            id: 1,
            title: "Why don't scientists trust atoms?",
            content: "Because they make up everything!"
        },
        {
            id: 2,
            title: "Parallel lines",
            content: "Parallel lines have so much in common. It’s a shame they’ll never meet."
        },
        {
            id: 3,
            title: "Broken pencil",
            content: "Why did the scarecrow win an award? Because he was outstanding in his field!"
        },
        {
            id: 4,
            title: "Math class",
            content: "Why was the math book sad? Because it had too many problems."
        },
        {
            id: 5,
            title: "Light bulb",
            content: "How many programmers does it take to change a light bulb? None, that's a hardware problem."
        }
    ];
    res.send(jokes); 
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server at http://localhost:${port}`);
});
