const axios = require('axios')




let variables
let querys

function setVariables() {
    const vars = require('./server.js')
    variables = vars.variables
}
function setQuery() {
    const thisQuery = require('./query.js')
    
}

async function getInfo(query) {
    setVariables()
    const res = axios({
        method: 'POST',
        url: 'https://graphql.anilist.co',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        data: JSON.stringify({
            query: query,
            variables: variables
        })
    })
    .then(async function (response) {
        // console.log(response.data.data.Page.media) = response of all shows
        return  response.data.data.Page
        
    })
    .catch(function (error) {
        console.log(error.response.statusText)
        console.log(error.response.data)
        console.log(error.response.data.errors[0].locations)
    })
    return handleResponse(res)
}

// const options = {
//     method: 'POST',
//     url: 'https://graphql.anilist.co',
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//     },
//     data: JSON.stringify({
//         query: query,
//         variables: variables
//     })
// }

async function handleResponse(res) {
    return res
}

module.exports = { getInfo }