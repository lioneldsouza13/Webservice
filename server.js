const express = require("express")
const app = express();
const cors = require("cors")
const bodyParser = require('body-parser')
const axios = require("axios")
const crypto = require("crypto")
const qs = require('querystring')
const port = process.env.PORT || 3001

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

require('dotenv').config()

//pattern of sending data 
//http://localhost:3001/parking?client_id=web2Call_<>&client_secret=abcd&data={"mobile":"999999999","ebi_tobacco":"No","apf_app_no":"OB81","apf_agnt_id":"1993"}

app.get('/parking', (req, res) => {
    var client_id = req.param("client_id")
    var client_secret = req.param("client_secret")
    var data = req.param("data")


    if (client_id === undefined || client_id === null || client_secret === undefined || client_secret === null || data === undefined || data === null) {
        res.send('Enter all parameters')

    }
    else {
        //Generating Access Token
        axios.get(process.env.authorize, {
            params: {
                'ipru.Grant_type': 'authorization_token',
                'ipru.Client_ID': client_id,
                'ipru.Client_Secret': client_secret,
                'ipru.Bearer': 'Bearer_ParkingData',
                'ipru.Refresh_token': 'Null'
            }
        }
        ).then((response) => {

            var access_token = response.data.access_token


            
            var obj = JSON.parse(data)
            var obj1 = JSON.stringify(obj)

            // generating digest value
            const hmac = crypto.createHmac('sha1', client_secret)
            hmac.update(obj1, 'utf-8')
            const digest = hmac.digest('hex')


            var body = {
                'ipru.Bearer': 'Bearer_ParkingData',
                'ipru.Client_ID': client_id,
                'ipru.Payload': obj1
            }


            axios({
                method: 'post',
                url: process.env.dataConsume,
                data: qs.stringify(body),
                headers: {
                    'ipru.DigestValue': digest,
                    'ipru.Access_token': access_token,
                    'Content-Type': 'application/x-www-form-urlencoded'

                }
            }).then((response) => {

                    res.send(response.data)
                }).catch((r) => {
                    console.log(r.config)
                    res.send('Error Check Logs')
                })


        })

    }
})



app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})