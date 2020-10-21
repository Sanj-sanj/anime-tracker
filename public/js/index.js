const siteStorage = localStorage
const watching = watchState()
const user = siteStorage.getItem('user')    
const spinner = document.querySelector('.spinner')
const insertPoint = document.querySelector('.row-card-area')
document.querySelectorAll('.change-season').forEach(btn => btn.addEventListener('click', changeSeason))
document.querySelectorAll('.f-choice a').forEach(link => link.addEventListener('click', changeFormat))
const selects = document.querySelectorAll('.custom-select')
    selects.forEach(el => el.addEventListener('change', sortShows))

function validateUser() {
    if(user) {
        console.log('welcome')
        const now = new Date()
        let key = localStorage.getItem('key')
        let key2 = localStorage.getItem('prev')
        let a = now.getSeconds()
        let b = now.getMinutes()
        b = (b * 60) + a 
        if(key && key2) {
            if(key == 'override') {
                return keyClean()
            }
            if(key >= b) {
                return keyClean()
            }
            localStorage.removeItem('prev')
            localStorage.removeItem('key')
        }
        return loadInfo()
    }
    else {
        window.location.href = '/login/user.html'
        console.log('No user')
    }
}

function keyClean(){
    console.log('cleaned')
    let temp = localStorage.getItem('prev')
    temp = JSON.parse(temp)
    localStorage.removeItem('prev')
    localStorage.removeItem('key')
    localStorage.removeItem('id')
    changeFormatHeaderFromCache(temp.format)
    return loadInfo(temp.season, temp.format)
}
validateUser()

function loadInfo(diffSeason, diffFormat) {
    //put this on the top navbar area
    // const newShows = document.querySelector('.anime-avail-bar')
    // newShows.textContent = `Welcome ${user}!`
    const seasonHeader = document.querySelector('.anime-season-header')
    const season = diffSeason || checkSeason()
    const format = diffFormat || checkFormat()
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
    arr.media.forEach(element => {
        // console.log(element.trailer ? element.trailer.site : `n/a for ${element.title.romaji}`)
        let information = {
            title: element.title,
            format: element.format || 'N/A',
            genres: element.genres,
            id: element.id,
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
    document.querySelectorAll('.main-title').forEach(el => el.style.webkitBoxOrient = 'vertical')
}

function sortShows() {
    let selection = [];
    selects.forEach((el) => selection.push(el.value))
    
    const res = sortBy(selection[0])
    insertPoint.innerHTML = `${res.map(el => el.c.outerHTML).join(' ')}`
    setTitles(selection[1])
    document.querySelectorAll('.btn-id').forEach(el => el.addEventListener('click', showMore))
    document.querySelectorAll('.btn-watching').forEach(el => el.addEventListener('click', watching.updateWatchState))
    document.querySelectorAll('.btn-consider').forEach(el => el.addEventListener('click', watching.updateWatchState))
    updateWatchStyle()
}




function buildCard(obj){
    const episodeDate = formatNextEpisodeDate(obj.nextEpisode, obj.status)
    let template = `
    <div class="card anime-card mb-3 col-md-4 col-xl-3" data-id="${obj.id}" data-watch="${watching.getWatchStates(obj.id)}" data-consider="${watching.getConsiderState(obj.id)}" ">

        <h5 class="anime-title" data-rom="${obj.title.romaji ? obj.title.romaji : obj.title.english}" data-en="${obj.title.english ? obj.title.english : obj.title.romaji}">
            <a class="main-title" href="${obj.officialSite.url}">${obj.title.english ? obj.title.english : obj.title.romaji} </a>
        </h5>
        <ol class="anime-genre">
            ${obj.genres.length >= 1 ? obj.genres.map((v,i,a) => `<li class="text-muted">${v}</li>`).join(' ') : '<li class="text-muted">No information</li>'}
        </ol>

    <div class="contents">
        <div class="col img-spot">
            <time class="countdown">${obj.nextEpisode.episode ? 'Ep ' + obj.nextEpisode.episode : ''} <span></span></time> 
            <img class="card-img-top anime-cover-image" src="${obj.coverImage.large}" alt="${obj.title.english ? obj.title.english : obj.title.romaji}" srcset="">
            <div class="format">
                <div class="format-text-area">📺 ${obj.format.replace("_", ' ') || 'Anime'}</div>
                </div>
                <div class="rating">
                <div class="rating-text-area">⭐ ${obj.score ? (obj.score /10).toFixed(1) : '?'}</div>
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
        <li class="icon">
            <button class="btn btn-sm btn-outline-success btn-watching">Watching</button>
        </li>
        <li class="icon">
            <button class="btn btn-sm btn-outline-warning btn-consider">Considering</button>
        </li>
        <li class="icon">
            <button class="btn btn-sm btn-outline-info btn-id">More info</button>
        </li>
    </ul>
    </div>
    `
    insertPoint.insertAdjacentHTML('beforeend', template)
}

function updateWatchStyle() {
    document.querySelectorAll('[data-watch="true"][data-consider="false"]').forEach(item => {
        item.children[0].style.background = 'linear-gradient(180deg, #ceff69, white)'
    })
    document.querySelectorAll('[data-consider="true"][data-watch="false"]').forEach(item => {
        item.children[0].style.background = 'linear-gradient(180deg, #fffd0d, white)'
    })
    document.querySelectorAll('[data-watch="false"][data-consider="false"]').forEach(item => {
        item.children[0].style.background = 'initial'
    })
}

function watchState() {
    let consider = localStorage.getItem('consider')
    consider == null ? consider = [] : consider = JSON.parse(consider)

    let watching = localStorage.getItem('watching')
    watching == null ? watching = [] : watching = JSON.parse(watching)

    function updateWatchState(e) {
        const parent = this.offsetParent.dataset
        if(this.classList.contains('btn-watching') ) {
            consider.includes(parent.id) ?
                (consider.splice(consider.indexOf(parent.id)), parent.consider = false) : false

            watching.includes(parent.id) ? 
                (watching.splice(watching.indexOf(parent.id), 1), parent.watch = false) :
                (watching.push(parent.id), parent.watch = true)
        }
        if(this.classList.contains('btn-consider')) {
            watching.includes(parent.id) ?
                (watching.splice(watching.indexOf(parent.id)), parent.watch = false) : false
                //can add a wardning message before ^ to the user to validate wether they'll go from watching to considering 
            consider.includes(parent.id) ?
                (consider.splice(consider.indexOf(parent.id), 1), parent.consider = false) :
                (consider.push(parent.id), parent.consider = true)
        }
        updateWatchStyle()
        saveWatching()
    }

    function getWatchStates(id) { 
        if( watching.includes(String(id)) ){
            return true
        }
        return false
    }
    function getConsiderState(id) {
        if( consider.includes(String(id)) ) {
            return true
        }
        return false
    }
    function log(){
        console.log({watching})
    }
    function saveWatching() {
        localStorage.setItem('watching', JSON.stringify(watching))
        localStorage.setItem('consider', JSON.stringify(consider))
    }
    return { updateWatchState, getWatchStates, getConsiderState, log }
}

function setTitles(string) {
    document.querySelectorAll('.anime-title').forEach((card, i) => {
        string == 'romaji' ? 
            (card.children[0].innerText = card.dataset.rom,
            card.children[0].title = card.dataset.rom) :
            (card.children[0].innerText = card.dataset.en,
            card.children[0].title = card.dataset.en)
    })
}

function sortBy(string) {
    const cards = document.querySelectorAll('.anime-card')
    const scoreCard = document.querySelectorAll('.meta-container')
    let sorted = []
    if(string == 'popularity') {
        scoreCard.forEach((card, i) => {
            const airDate = card.children[0].children[1].textContent == 'Finished' ? 'Finished' :(new Date(card.children[0].children[1].textContent))
            const cd = airDate == 'Finished' ? 'Finished' : (airDate - Date.now())
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
            const airDate = card.children[0].children[1].textContent == 'Finished' ? 'Finished' :(new Date(card.children[0].children[1].textContent))
            const cd = airDate == 'Finished' ? 'Finished' : (airDate - Date.now()) 
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
            const airDate = card.children[0].children[1].textContent == 'Finished' ? 'Finished' :(new Date(card.children[0].children[1].textContent))
            const cd = airDate == 'Finished' ? 'Finished' : (airDate - Date.now())
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
            const airDate = card.children[0].children[1].textContent == 'Finished' ? 'Finished' :(new Date(card.children[0].children[1].textContent))
            const cd = airDate == 'Finished' ? 'Finished' : (airDate - Date.now()) 
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
    }
    timer.resetTimer()
    createCountdowns(sorted) //calcjs
    return sorted
}

function changeFormat(e) {
    document.querySelector('.f-choice.active').classList.remove('active')
    this.parentNode.classList.add('active')
    const currSeason = document.querySelector('.anime-season-header').textContent.split(' ').join('-').toLocaleUpperCase()
    const format = e.target.dataset.format
    timer.resetTimer()
    loadInfo(currSeason, format)
}
function changeFormatHeaderFromCache(format) {
    document.querySelector('.f-choice.active').classList.remove('active')
    document.querySelectorAll('.f-choice>a').forEach(tag => tag.dataset.format == format ? tag.parentNode.classList.add('active') : false )
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

function formatNextEpisodeDate(obj, obj2) {
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
function checkFormat() {
    let format
    document.querySelectorAll('.f-choice').forEach(el => el.classList.contains('active') ? format = el.children[0].dataset.format : false)
    return format
}

function saveCurrentSeason(season, format) {
    const previous = JSON.stringify({season, format})
    localStorage.setItem('prev', previous)
}

function showMore(e){
    const season = document.querySelector('.anime-season-header').textContent.replace(' ', '-').toUpperCase()
    const format = checkFormat()
    saveCurrentSeason(season, format)
    timer.resetTimer()
    const id = this.offsetParent.dataset.id
    localStorage.setItem('id', id)
    window.location.replace('/show') 
}
