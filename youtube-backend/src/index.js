import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
})

let PORT = process.env.PORT || 8001;

connectDB()
.then(() => {
    app.on('error', (error) => {
        console.log("Error: ", error);
        throw error;
    });

    app.listen(PORT, ()=>{
        console.log(`Server running on port: ${PORT}`)
    });
})
.catch((err)=> 
    console.log("MongoDB Connection Failed !!: ", err)
)

