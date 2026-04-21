import OpenAI from "openai";
import { Router } from "express"

const router = Router()

const API_KEY = process.env.API_KEY

if(!API_KEY){
    throw new Error('API_KEY must be informed');
}

const client = new OpenAI({apiKey: API_KEY});


router.get('/product', async (req, res)=>{
    const product = req?.query?.product

    console.log('Product: ', product)

    if(!product){
        return res.status(400).send('<h2>PARAM PRODUCT MUST BE SENT</h2>')
    }

    console.log('Pensando...')

    const response = await client.responses.create({
        model: "gpt-5.4-nano",
        input: `Me dê um guia de compra mínimo sobre o produto: ${product}! Preciso saber componentes desse produto, subtipos desse produto que atendem diferentes necssidades, e quais as melhores marcas desse produto. NÃO RETORNE MARKDOWN. Sua resposta DEVE ser gerada em tags html (só conteúdo, sem tag <body>, <head> ou <html>)`
    });

    console.log('Resposta recebida')
    console.log(response)

    // res.send(response.output_text)
    res.send(response.output_text)


})

export default router;