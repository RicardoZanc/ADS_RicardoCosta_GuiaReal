import 'dotenv/config';
import express from "express";
import chalk from "chalk";
import openAPIRouter from "./openAPI/openAPIRouter";

const PORT = process.env.PORT || 3000


const app = express();

app.use(express.json())
app.use('/openAPI', openAPIRouter)




app.listen(PORT, ()=>{
    const runningMsg = 'Serving runnning on port ' + PORT;    

    console.log(chalk.bgGreen.blackBright(` ${runningMsg} `))
})

