const express = require('express')
const server = express()
const port = process.env.PORT || 3001;
const graphQL = require('./graphql.js');
const thisQuery = require('./query.js')
const path = require('path')


server.get('/', (req, res) =>{
server.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
server.use('/js', (express.static(__dirname + '/node_modules/bootstrap/dist/js')))

    console.log(req.headers["user-agent"])
    res.sendFile(__dirname, 'index.html')
})

server.get('/show', (req, res) => {
    console.log(__dirname + '\\public')
    res.sendFile(__dirname + '/public/show.html')
})

server.get('/anime/:id', (req, res) => {
    console.log(req.params.id)
    
    var variables = {
        id: req.params.id,
    };
    module.exports = {variables}
    let info
    async function request() {
        await graphQL.getInfo(thisQuery.queryMain)
            .then(data => {
                res.status(200).json(data)
                return info = data
            })
    }
    request()
    return info
})


server.get( '/main/:season/:format?' ,async (req, res) => {
    var variables = {
        // id: 112124,
        isAdult: false,
        page: 1,
        perPage: 50,
        format_in: ['TV', 'TV_SHORT'], //defaults to TV series
        season: "",
        seasonYear: ""
    
    };
    module.exports = {variables}
    let {season, format} = req.params
    console.log(season, format)

    season = season.split('-')
    variables.season = season[0].toUpperCase()
    variables.seasonYear = season[1]
    format !== undefined ? format == 'TV' ? format = ['TV', 'TV_SHORT'] : format == ['OVA'] ? format = ['OVA', 'ONA'] : format = format.split('-') : format = variables.format_in //this be changed 
    
    variables.format_in = format.map(form => form.toUpperCase())
    console.log(season, format, variables)

    let info
    async function request() {
        await graphQL.getInfo(thisQuery.queryMain)
            .then(data => {
                res.status(200).json(data)
                return info = data
            })
    }
    await request()
    console.log(info.pageInfo)
    return info
})

server.use(express.static(__dirname + '/public' ))

server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})
