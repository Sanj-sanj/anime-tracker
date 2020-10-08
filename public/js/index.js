const siteStorage = localStorage
const user = siteStorage.getItem('user')    
let insertPoint = document.querySelector('.row-card-area')
const timer = countingFunc()

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

function loadInfo() {
    const newShows = document.querySelector('.anime-avail-bar')
    newShows.textContent = `Welcome ${user}!`
    const season = checkSeason()
    console.log(season)
    if(!checkCache(season)){
        console.log('loading from API')
        return gatherAPI()
    }
    return console.log('loading from cache')
}

function gatherAPI() {
    console.log('calling api')
    let res = fetch('/info')
    .then(function(resp) {
        return resp.json()
    })
    Promise.resolve(res)
        .then(function (val){
            loopInnerItems(val)
        })
}
function loopInnerItems(arr) {
    arr.media.forEach(element => {
        let information = {
            title: element.title,
            genres: element.genres,
            prodCompany: element.studios,
            nextEpisode: element.nextAiringEpisode,
            source: element.source,
            episodes: element.episodes,
            duration: element.duration,
            description: element.description,
            coverImage: element.coverImage,
            officialSite: element.externalLinks.find(link => link.site =='Official Site')
        }
        buildCard(information)  
    });
    saveHistory()
}

function countingFunc() {
    let called = 0
    let stringCounter 
    let arr = []
    function countdown (nextEp) {
        let counter = setInterval(() => {
            if(nextEp == null) {
                arr.push('No information')
                if(arr.length == called) {
                    displayTime(arr)
                    arr= []
                }
                return 
            }
            const today = new Date()
            const days = nextEp.getDate() - today.getDate()
            const totalSeconds = Math.round((nextEp - Date.now()) / 1000)
            const totalMins = totalSeconds / 60
            const seconds = Math.round((nextEp - Date.now()) / 1000) % 60
            const mins =  Math.floor(totalMins) % 60
            const hours = Math.floor(totalMins / 60) % 24

            stringCounter = `${days}d ${hours}h ${mins < 10 ? '0' : ''}${mins}m ${seconds < 10 ? '0' : ''}${seconds}s`
            arr.push(stringCounter)
            if(arr.length == called) { //only call this once all values have filled the array to prevent flickering the time.
                displayTime(arr)
                arr = []
                return
            }
        }, 1000)
    }
    function timesCalled() {
        called++
    }
    return {countdown, timesCalled}
}

function displayTime(arr) {
    const timerArea = document.querySelectorAll('.countdown')
    timerArea.forEach(function (v, i, a) {
        v.textContent = `${arr[i]}`
    })
}
function handleTime(obj) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    if(obj == null || obj.timeUntilAiring == null) {
        timer.timesCalled()
        timer.countdown(null)
        return `No infomation`
    }
    const nextEpDate = new Date()
        nextEpDate.setSeconds(obj.timeUntilAiring)
    let nextEpMinsRounded = Math.ceil(nextEpDate.getMinutes() / nextEpDate.getMinutes() + nextEpDate.getMinutes()).toFixed(1)
        nextEpMinsRounded.replace('.', '')
    
    timer.timesCalled() 
    timer.countdown(nextEpDate)
    return `${days[nextEpDate.getDay()]} ${months[nextEpDate.getMonth()]} ${nextEpDate.getDate()} ${nextEpDate.getFullYear()} ${nextEpDate.getHours()}:${nextEpDate.getMinutes() < 10 ? '0' + nextEpDate.getMinutes() : nextEpDate.getMinutes()} `
}

//do something with the links at the bottom
function buildCard(obj){
    const episodeDate = handleTime(obj.nextEpisode)
    let template = `
    <div class="card anime-card mb-3 col-md-4 col-xl-3">

        <h5 class="anime-title">
            <a href="${obj.officialSite.url}">${obj.title.english ? obj.title.english : obj.title.romaji}</a>
        </h5>
        <ol class="anime-genre">
            ${obj.genres.map((v,i,a) => `<li class="text-muted">${v}</li>` ).join(' ')}
        </ol>

    <div class="contents">
        <div class="col img-spot">
            <time class="countdown"></time> 
            <img class="card-img-top anime-cover-image" src="${obj.coverImage.large}" alt="${obj.title.english ? obj.title.english : obj.title.romaji}" srcset="">
        </div>
        <div class="row no-gutters row-anime-info">
            <div class="anime-info col border-top border-left">
                <div class="meta-container">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item company">${obj.prodCompany.nodes[0].name}</li>
                        <li class="list-group-item date">${episodeDate}</li>
                        <li class="list-group-item meta-data">
                            <div class="source">${obj.source.replace('_',' ')}</div>
                            <div class="episodes">${obj.episodes ? obj.episodes : '12?'} x ${obj.duration ? obj.duration + ' min' : '24 min?'}</div>
                        </li>
                    </ul>
                </div>
                <div class="anime-description">
                    ${obj.description}
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

function updateTimes(obj) {
    let dateDOMLocation = document.querySelectorAll('.list-group-item.date')
    obj.media.forEach((element, i, arr) => {
        const episodeDate = handleTime(element.nextAiringEpisode)
        dateDOMLocation[i].textContent = episodeDate
    })
}

function saveHistory() {
    const season = checkSeason()
    siteStorage.setItem(season, insertPoint.innerHTML)
}

function checkCache(key) {
    if(siteStorage.hasOwnProperty(key)) {
        insertPoint.insertAdjacentHTML('beforeend', siteStorage.getItem(key))
        const times = fetch('/timers')
            .then(function(resp) {
                return resp.json()
            })
            Promise.resolve(times)
                .then(function (val){
                    updateTimes(val)
                })
        saveHistory()
       return true
    }
    return false
}

function checkSeason() {
    let now = new Date()
    const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    let seasonAsInt = Math.round(thisMonth / 3)
        seasonAsInt == 4 ? seasonAsInt = 0 : seasonAsInt
    
    const thisSeason = `${seasons[seasonAsInt]} ${thisYear}`
    return thisSeason
}
