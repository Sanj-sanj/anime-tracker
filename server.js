const express = require('express')
const server = express()
const port = process.env.PORT || 3001;
const graphQL = require('./graphql.js');
const thisQuery = require('./query.js')


server.get('/', (req, res) =>{
    console.log(req.headers["user-agent"])
    res.sendFile(__dirname, 'index.html')
    // res.status(200).json({data: 'data'})
})


var variables = {
    format: 'TV',
    season: "FALL",
    seasonYear: "2020",

};

server.get('/info',async (req, res) => {
    let info
    async function request() {
        await graphQL.getInfo(thisQuery.queryMain)
            .then(data => {
                res.status(200).json(data)
                return info = data
            })
    }
    await request()
    return info
})

server.get('/timers', async(req, res) => {
    let times
    async function requestTime() {
        await graphQL.getInfo(thisQuery.queryTimes)
            .then(data => {
                res.status(200).json(data)
                return time = data
            })
    }
    await requestTime()
    return times
})

server.use(express.static(__dirname + '/public' ))

server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})

module.exports = {variables}