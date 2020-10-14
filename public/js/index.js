
const timer = countingFunc()
const changeTitles = sortNames()
const siteStorage = localStorage
const user = siteStorage.getItem('user')    
const spinner = document.querySelector('.spinner')

const insertPoint = document.querySelector('.row-card-area')
document.querySelectorAll('.change-season').forEach(btn => btn.addEventListener('click', changeSeason))
document.querySelectorAll('.f-choice a').forEach(link => link.addEventListener('click', changeFormat))
const selects = document.querySelectorAll('.custom-select')
    selects.forEach(el => el.addEventListener('change', sortShows))
let showCountdown

function validateUser() {
    if(user) {
        console.log('welcome')
        return loadInfo()
    }
    else {
        window.location.href = '/login/user.html'
        console.log('No user')
    }
}
validateUser()


function sortShows() {
    let selection = [];
    selects.forEach((el) => selection.push(el.value))
    console.log(selection)
    const res = sortBy(selection[0])
    insertPoint.innerHTML = `${res.map(el => el.c.outerHTML).join(' ')}`
    changeTitles.flip(selection[1])
    //create bool to pass to buildcards to set titles lang prefs
}
function sortNames() {
    let currLang = 'english'
    let prevTitles = []
    
    function flip(string) {
        let cards = document.querySelectorAll('[data-alt]')
        if(currLang != string) {
            prevTitles = []
            cards.forEach((card, i) => {
                prevTitles.push(card.innerText)
                card.innerText = card.dataset.alt
                card.dataset.alt = prevTitles[i]
                currLang = string
            })
        }
    }
    return {flip}
}

function sortBy(string) {
    let cards = document.querySelectorAll('.anime-card')
    let scoreCard = document.querySelectorAll('.meta-container')
    let times = document.querySelectorAll('span')
    let sorted = []
    if(string == 'popularity') {
        scoreCard.forEach((card, i) => {
            const airDate = new Date(card.children[0].children[1].textContent)
            const cd = (airDate - Date.now()) / 1000
            const p = card.dataset.popularity
            const c = cards[i]
            sorted.push({c, p, cd})
        })
        sorted = sorted.sort(function (a, b) {
            return b.p - a.p
        })
    }
    if(string == 'countdown') {
        const notNumeric = []       //some return values are not numeral ex finished or releasing so check for those.
        scoreCard.forEach((card, i) => {
            const airDate = new Date(card.children[0].children[1].textContent)
            const cd = (airDate - Date.now()) / 1000
            const c = cards[i]
            if(!Number(card.dataset.cd)) {
                return notNumeric.push({c, cd})
            }
           sorted.push({c, cd})
       }) 
       sorted = sorted.sort(function (a, b) {
           return Number(a.cd) - Number(b.cd)
       }).concat(notNumeric)
    }
    if(string == 'rating') {
        const noRating = []
        scoreCard.forEach((card, i) => {
            const airDate = new Date(card.children[0].children[1].textContent)
            const cd = (airDate - Date.now()) / 1000
            const s = card.dataset.score
            const c = cards[i]
            if(!Number(s)) {
                return noRating.push({c, s, cd})
            } 
            sorted.push({c, s, cd})
        })
        sorted = sorted.sort(function (a, b) {
            return b.s - a.s
        }).concat(noRating)
    }
    if(string == 'air-date') {
        const noDate = []
        scoreCard.forEach((card, i) => {
            const airDate = new Date(card.children[0].children[1].textContent)
            const cd = (airDate - Date.now()) / 1000
            const d = new Date(card.dataset.start)
            const c = cards[i]
            if(d == 'Invalid Date') {
                return noDate.push({c, d, cd})
            }
            sorted.push({c, d, cd})
        })
        sorted = sorted.sort(function (a, b) {
            return a.d - b.d
        }).concat(noDate)
        console.log(sorted)
    }
    timer.resetTimer()
    createCountdowns(sorted)
    return sorted
}

function changeFormat(e) {
    const activeLink = document.querySelector('.f-choice.active').classList.remove('active')
    const currSeason = document.querySelector('.anime-season-header').textContent.split(' ').join('-').toLocaleUpperCase()
    const format = e.target.dataset.format
    this.parentNode.classList.add('active')
    timer.resetTimer()
    loadInfo(currSeason, format)
}

function changeSeason(e){
    e.preventDefault()
    const currSeason = document.querySelector('.anime-season-header').textContent.split(' ')
    const format = document.querySelector('.f-choice.active').children[0].dataset.format
    const change = this.dataset.position
    const season = checkSeason(...currSeason, change)
    timer.resetTimer()
    loadInfo(season, format)
}

function loadInfo(changeSeason, format) {
    //put this on the top navbar area
    // const newShows = document.querySelector('.anime-avail-bar')
    // newShows.textContent = `Welcome ${user}!`
    const seasonHeader = document.querySelector('.anime-season-header')
    const season = changeSeason || checkSeason()
    seasonHeader.textContent = `${season.charAt(0) + season.slice(1).replace('-', ' ').toLocaleLowerCase()}`
    insertPoint.textContent = ''
    gatherAPI(season, format)
}

function gatherAPI(season, format) {
    console.log('calling api')
    let values 
    spinner.style.display = 'inherit'
    let res = fetch(`/main/${season}/${format == null ? '' : format}`)
    .then(function(resp) {
        return resp.json()
    })
    Promise.resolve(res)
        .then(function (val){
            values = val
            loopInnerItems(val)
            spinner.style.display = 'none'
        })
        return values
}
function loopInnerItems(arr) {
    console.log(arr)
    arr.media.forEach(element => {
        let information = {
            title: element.title,
            format: element.format || 'N/A',
            genres: element.genres,
            nextEpisode: element.nextAiringEpisode || 'N/A',
            prodCompany: element.studios.nodes.find(studio => studio.isAnimationStudio) || 'N/A',
            popularity: element.popularity,
            score: element.meanScore,
            source: element.source || 'N/A',
            status: element.status || 'N/A',
            startDate: element.startDate || null,
            episodes: element.episodes,
            duration: element.duration,
            description: element.description,
            coverImage: element.coverImage,
            officialSite: element.externalLinks.find(link => link.site =='Official Site') || '#'
        }
        buildCard(information)  
    });
    sortShows()
    saveHistory()
}

function getDaysInAMonth (month, year) {
    return new Date(year, month, 0).getDate()
}
function countDaysBetweenMonths(today, nextDate) {
    const daysInBtwnARR = []
    let nextEpMonth = nextDate.getMonth() 
    //get remaining days left in this month + the days till the air date of airing month
    daysInBtwnARR.push(nextDate.getDate(), (getDaysInAMonth(today.getMonth() + 1, today.getFullYear())) - today.getDate())
    if(nextDate.getFullYear() != today.getFullYear()) {
        for(let i = 0; i < nextEpMonth; i++) {
            daysInBtwnARR.push(getDaysInAMonth(nextEpMonth + 1, nextDate.getFullYear()))
        }
        nextEpMonth = 12
    }
    
        console.log(nextDate.getMonth())
    for(nextEpMonth; nextEpMonth > today.getMonth(); nextEpMonth--) {
        if(nextEpMonth - 1 > today.getMonth()) {
            daysInBtwnARR.push(getDaysInAMonth(nextEpMonth + 1, nextDate.getFullYear()))
        }
    }
    return days = daysInBtwnARR.reduce((acc, curr) => acc += curr)
}
function countingFunc() {
    let called = 0
    let stringCounter 
    let arr = []
    let cdArr = []
    function countdown (nextEp) {
        showCountdown = setInterval(() => {
            if(nextEp == "FINISHED") {
                arr.push('Finished')
                if(arr.length == called) {
                    displayTime(arr)
                    arr= []
                }
                return
            }
            if(isNaN(nextEp)) { // DISPLAY RELEASED IF AIR DATE IS ALREADY PASSED
                arr.push('No information')
                if(arr.length == called) {
                    displayTime(arr)
                    arr= []
                }
                return 
            }
            const today = new Date()
            let days = (nextEp.getDate() - today.getDate()) 
            const totalSeconds = Math.round((nextEp - Date.now()) / 1000)
            const totalMins = totalSeconds / 60
            const seconds = Math.round((nextEp - Date.now()) / 1000) % 60
            const mins =  Math.floor(totalMins) % 60
            const hours = Math.floor(totalMins / 60) % 24
            if(nextEp.getMonth() != today.getMonth()) {
                days = countDaysBetweenMonths(today, nextEp)
            }
            
            stringCounter = `${days}d ${hours}h ${mins < 10 ? '0' : ''}${mins}m ${seconds < 10 ? '0' : ''}${seconds}s`
            arr.push(stringCounter)
            if(arr.length == called) { //only call this once all values have filled the array to prevent flickering the time.
                displayTime(arr)
                arr = []
                return
            }
        }, 1000)
        cdArr.push(showCountdown)
    }
    function timesCalled() {
        called++
    }
    function resetTimer(){
        //reset the countdown for different pages YOU HAVE TO STORE EACH TIMER IN AN ARRAY TO REFRENCE IT WOOO BOY
        cdArr.forEach(timer => clearTimeout(timer))
        called = 0
        cdArr = []
        arr = []
        return
    }
    function show() {
        console.log({called, arr, cdArr})
    }
    return {countdown, timesCalled, resetTimer, show}
}

function displayTime(arr) {
    const timerArea = document.querySelectorAll('.countdown')
    timerArea.forEach(function (v, i, a) {
        v.children[0].textContent = `${ arr[i]}`
    })
}
function createCountdowns(arr) {
    arr.forEach(item => {
        if(!Number(item.cd)) {
            timer.timesCalled()
            timer.countdown(item.cd)
            return
        }
        const nextEp = new Date()
        nextEp.setSeconds(item.cd)
        timer.timesCalled()
        timer.countdown(nextEp)
    })
}

function handleTime(obj, obj2) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    if(obj2 == "FINISHED") {
        return `Finished`
    }
    if(obj == null || obj.timeUntilAiring == null) {
        return `No infomation`
    }
    const nextEpDate = new Date()
        nextEpDate.setSeconds(obj.timeUntilAiring)
    let nextEpMinsRounded = Math.ceil(nextEpDate.getMinutes() / nextEpDate.getMinutes() + nextEpDate.getMinutes()).toFixed(1)
        nextEpMinsRounded.replace('.', '')
    return `${days[nextEpDate.getDay()]} ${months[nextEpDate.getMonth()]} ${nextEpDate.getDate()} ${nextEpDate.getFullYear()} ${nextEpDate.getHours()}:${nextEpDate.getMinutes() < 10 ? '0' + nextEpDate.getMinutes() : nextEpDate.getMinutes()} `
}

//do something with the links at the bottom
function buildCard(obj){
    const episodeDate = handleTime(obj.nextEpisode, obj.status)
    let template = `
    <div class="card anime-card mb-3 col-md-4 col-xl-3">

        <h5 class="anime-title" data-alt="${obj.title.romaji ? obj.title.romaji : obj.title.english}">
            <a href="${obj.officialSite.url}">${obj.title.english ? obj.title.english : obj.title.romaji}</a>
        </h5>
        <ol class="anime-genre">
            ${obj.genres.length >= 1 ? obj.genres.map((v,i,a) => `<li class="text-muted">${v}</li>`).join(' ') : '<li class="text-muted">No information</li>'}
        </ol>

    <div class="contents">
        <div class="col img-spot">
            <time class="countdown">${obj.nextEpisode.episode ? 'Ep ' + obj.nextEpisode.episode : ''} <span></span></time> 
            <img class="card-img-top anime-cover-image" src="${obj.coverImage.large}" alt="${obj.title.english ? obj.title.english : obj.title.romaji}" srcset="">
            <div class="format">
                <div class="format-text-area">${obj.format.replace("_", ' ') || 'Anime'}</div>
            </div>
        </div>
        <div class="row no-gutters row-anime-info">
            <div class="anime-info col border-top border-left">
                <div class="meta-container" data-popularity='${obj.popularity}' data-score='${obj.score}' data-cd='${obj.nextEpisode.timeUntilAiring || obj.status}' data-start='${obj.startDate.year}, ${obj.startDate.month - 1}, ${obj.startDate.day}' ">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item company">${obj.prodCompany.name || 'No information'}</li>
                        <li class="list-group-item date">${obj.status == "FINISHED" ? 'Finished' : episodeDate}</li>
                        <li class="list-group-item meta-data">
                            <div class="source">${obj.source.replace('_',' ')}</div>
                            <div class="episodes">${obj.episodes ? obj.episodes : '12?'} x ${obj.duration ? obj.duration + ' min' : '24 min?'}</div>
                        </li>
                    </ul>
                </div>
                <div class="anime-description">
                    ${obj.description || 'No synopsis has been added yet.'}
                </div>
            </div>
        </div>
    </div>
    <ul class="links icons">
        <ul class="icon">1</ul>
        <ul class="icon">2</ul>
        <ul class="icon">3</ul>
    </ul>
    </div>
    `
    insertPoint.insertAdjacentHTML('beforeend', template)
}

//these can go in a different file soon
function updateTimes(obj) {
    let dateDOMLocation = document.querySelectorAll('.list-group-item.date')
    obj.media.forEach((element, i, arr) => {
        try {
            const episodeDate = handleTime(element.nextAiringEpisode)
            dateDOMLocation[i].textContent = episodeDate
        } catch(error) {
            console.log(error, {element})
        }
    })
}

function saveHistory() {
    const season = checkSeason()
    siteStorage.setItem(season, insertPoint.innerHTML)
}

//this needs a re-write to work with the dynamic enpoints of the server's GET params. need a way of caching tv, movies, OVA, ONAs seperately 
//or it might be redundant
function checkCache(key) {
    if(siteStorage.hasOwnProperty(key)) {
        insertPoint.insertAdjacentHTML('beforeend', siteStorage.getItem(key))
        const times = fetch('/timers')
            .then(function(resp) {
                return resp.json()
            })
            Promise.resolve(times)
                .then(function (val){
                    console.log(val)
                    updateTimes(val)
                })
        saveHistory()
       return true
    }
    return false
}

function checkSeason(season, year, position) {
    const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
    if(season && year) {
        // console.log(season, year, position)
        let ind = seasons.indexOf(season.toUpperCase())
        year = Number(year)
        if(position == 'up') {
            ind++
            ind == 4 ? (ind = 0, year++): ind
        }
        if(position == 'down') {
            ind--
            ind < 0 ? (ind = 3, year--) : ind
        }
        return `${seasons[ind]}-${year}`
    }

    let now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    let seasonAsInt = Math.round(thisMonth / 3)
    seasonAsInt == 4 ? seasonAsInt = 0 : seasonAsInt
    return `${seasons[seasonAsInt]}-${thisYear}`
}
