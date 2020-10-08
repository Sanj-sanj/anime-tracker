const axios = require('axios')
const cheerio = require('cheerio')
const fillData = handleData()

const feed = 'https://www.livechart.me/feeds/episodes'

const fetchSiteData = async (url) => {
    const result = await axios.get(url)
    return cheerio.load(result.data)
}

const scrapeEpisodeInfo = async (url) => {
    const $ = await fetchSiteData(url)
    const description = $('.expandable-text-body').text()

    let nextAirDate = $('.info-bar-placeholder').text()
    const jsonString = $('script[type="application/ld+json"]').html()
    const showInfo = JSON.parse(jsonString)
        showInfo.nextAirDate = formatDate(nextAirDate)
        showInfo.description = description
    return showInfo
} 

const scrapeFeed = async () => {
    const $ = await fetchSiteData(feed);
    $('item').each((i,el) =>{
        let liveLink = $(el).find('link')[0].next.data
        fillData.fillArr(liveLink)
    })
    return collectData()
}

let testdate = 'Oct 10 at 9:00am UTC'

function formatDate(date) {
    const now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth()
    const regex = /(am)|(pm)|(at)/g
    let dateArr = date.split(' ')
    if(dateArr[0] == 'Jan' && month == 12 ) {
        year = year + 1 
    }
    let mapped = dateArr.map((val ,i ,arr) => {
        //if the time is pm and not 12pm split it in an array and add 12hr's to the hour.
        if(val.includes('pm')) {
            let timeConverted;
            timeConverted = val.split(':')
            if(timeConverted[0] != 12) {
                timeConverted[0] = Number(timeConverted[0]) + 12
                val = timeConverted.join(':')
            }
        }       
        val = val.replace(regex, '')
        return val
    })
    return date = mapped.join(' ') + ' ' + year
}


function handleData() {
    const arr = []
    const masterArr = []
    function fillArr(obj) {
        arr.push(obj)
    }
    function fillMaster(obj){
        masterArr.push(obj)
    }
    return {fillArr, fillMaster, arr, masterArr}
}

async function collectData() {
    for(let i = 0; i < fillData.arr.length; i++) {
        let info = await scrapeEpisodeInfo(fillData.arr[i])
        fillData.fillMaster(info)
    }
    return fillData.masterArr
}

const startScrape = async () => {
    return await scrapeFeed()
}

module.exports = {startScrape}