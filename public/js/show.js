const revealDescription = toggleDesc()
let hBox = hoverBoxWrapper()
document.querySelector('.navbar-text>a').addEventListener('click', makeKey) 

function setLeaveTimer() {

    let now = new Date()
    let m = now.getMinutes()
    let s = now.getSeconds()
    m = (m * 60) + s + 60
    key = JSON.stringify(m)
    localStorage.setItem('key', key)
}
function makeKey() {
    localStorage.setItem('key', 'override')
}


function getInfo() {
    makeKey()
    const id = localStorage.getItem('id')
    let value
    let res = fetch(`/anime/${id}`)
    .then(res => {
        return res.json()
    })
    Promise.resolve(res)
        .then(function (val) {
            value = val
            makeArrMethodsAvail(val)
        })
        setLeaveTimer()
}
getInfo()

function makeArrMethodsAvail(arr) {
    arr.media.forEach(v => {
        let items = { 
            score: v.meanScore || '?',
            banner: v.bannerImage,
            poster: v.coverImage.large,
            description: v.description || '<i>No synopsis has been provided yet.</i>',
            episodes: v.episodes || '?',
            duration: v.duration || '?',
            links: v.externalLinks,
            format: v.format || 'N/A',
            genres: v.genres,
            hashtag: v.hashtag,
            nextEp: v.nextAiringEpisode,
            popularity: v.popularity,
            relations: v.relations,
            season: v.season,
            siteUrl: v.siteUrl,
            source: v.source || 'N/A',
            start: v.startDate,
            status: v.status,
            stream: v.streamingEpisodes,
            studio: v.studios.nodes.find(el => el.isAnimationStudio) || 'N/A',
            synonym: v.synonyms,
            tags: v.tags.length > 0 ? v.tags : null,
            title: v.title,
            trailer: v.trailer
        }
        build(items)
        addFunctionality()
        items.nextEp ? createCountdowns(null, items.nextEp.timeUntilAiring) : false
    })
}

function addFunctionality() {
    const description = document.querySelector('.anime-description')
    const toggleBox = document.querySelector('.toggle-text')
    document.querySelectorAll('.btn-show-txt').forEach(btn => btn.addEventListener('click', revealDescription.toggleView))
    document.querySelectorAll('.tags-section>li').forEach(tag => tag.addEventListener('click', hBox.mobileHoverBox))

    if(description.clientHeight >= 200) {
        description.classList.add('collapsed')
        description.classList.remove('mb-3')
        toggleBox.classList.remove('hidden')
    }
}

function hoverBoxWrapper() {
    const timeouts = []
    function mobileHoverBox() {
        const prev = document.querySelector('.hover-container')
        if(prev) {
            dBox()
        }
        const container = document.createElement('div')
            container.className = 'hover-container'
        const box = document.createElement('div')
            box.className = 'alert alert-info'
            box.textContent = this.title
        container.appendChild(box)
        this.appendChild(container)
        setTimeout(createRemove, 100)
    }
    function createRemove() {
        const tOut = setTimeout(dBox, 5000)
        window.self.addEventListener('click', dBox)
        timeouts.push(tOut)
    }
    function dBox() {
        clearTimeout(timeouts[0])
        timeouts.shift()
        window.self.removeEventListener('click', dBox)
        const prev = document.querySelector('.hover-container')
        prev.remove()
    }
    return {mobileHoverBox}
}

function toggleDesc() {
    let toggle = false
    function toggleView(e) {
        const description = document.querySelector('.anime-description')
        if(toggle) {
            e.target.classList.add('hidden')       
            e.target.previousElementSibling.classList.remove('hidden')
            description.classList.add('collapsed')
            return toggle = false
        }
        e.target.classList.add('hidden')
        e.target.nextElementSibling.classList.remove('hidden')
        description.classList.remove('collapsed')
        return toggle = true
    }
    return {toggleView}
}


function formatDate(year, month, day) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[month - 1] ?? ''} ${day || ''} ${year || ''}`
}

function build(res) {
document.querySelector('.title-banner').src = res.banner || 'imgs/d_banner.png'
const container = document.querySelector('.main-container')
const externals = [{["Official Site"]: 'site_ico', ["Twitter"]: 'twt_ico'}, {["Crunchyroll"]: 'crn_ico'}, {["VRV"]: 'vrv_ico'}, {['Funimation']: 'funi_ico'}, {['Hulu']: 'hulu_ico'}, {['Youtube']: 'ytb_ico'}, {['AnimeLab']: 'alab_ico'}, {['Hidive']: 'hidive_ico'}]

const dateFormatted = formatDate(res.start.year, res.start.month, res.start.day)
    let template = `
    <div class="card">
        <div class="card-body">
            <h2 class="card-title">${res.title.romaji}</h2>
            <h6 class="card-subtitle mb-2 text-muted mb-2">${res.title.english || res.title.romaji}</h6>
                <div class="countdown-container">
                    <div class="countdown countdown-show mb-2">
                    ${res.status == "FINISHED" ? 'Finished' : res.status == "NOT_YET_RELEASED" ? 'TBA' : res.nextEp.episode ? 'EP ' + res.nextEp.episode : '' } <span></span>
                    </div>
                </div>
                <div class="row row-poster-meta-info mb-3">
                    <div class="col poster">
                        <div class="anime-poster-area">
                            <img class= "anime-poster border border-dark" src=${res.poster} alt="${res.title.romaji}">
                        </div>
                        <span class="library-position border border-top-0 border-primary">
                            Watch
                        </span>
                    </div>
                    <div class="meta-tags-box col">
                        <div class="rating-box ">
    
                            <div class="rating-title">Rating</div>
                            <div class="show-rating border border-top-0 border-dark">
                                ${res.score}
                            </div>
                            <div class="premiered small">
                                    Premiere : ${dateFormatted}
                            </div>
                            <div class="synonym">${ `<i>${res.synonym.find(el => el.length < 30) || ''}</i>`}</div>
                            <div class="studio">${res.studio == 'N/A' ? 'No information' : res.studio.name}</div>
    
                            <div class="tags">
                                <ul class="genres">${res.genres.map(genre => `<li>${genre}</li>`).join(' ')}
                                </ul>
                            </div>
    
                        </div>                            
                    </div>
                    
                </div>
                <div class="row meta-info mb-2 border-top border-bottom">
                    <div class="info-box">
                        <div class="info-label">Format</div>
                        <div class="info-value">${res.format.split('_').map(v => v.charAt(0) + v.slice(1).toLowerCase()).join(' ')}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Source</div>
                        <div class="info-value">${res.source.split('_').map(v => v.charAt(0) + v.slice(1).toLowerCase()).join(' ')}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Episodes</div>
                        <div class="info-value">${res.episodes}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Run time</div>
                        <div class="info-value">${res.duration} min</div>
                    </div>
                    
                </div>
                <div class="row show-info-bottom">
                    <div class="col anime-description-box">
    
                        
                        <div class=" anime-description mb-3">
                            ${res.description}
                        </div>
                        
                        <div class="toggle-text mb-3 hidden">
                            <button class="btn btn-sm btn-show-txt">SHOW MORE</button>
                            <button class="btn btn-sm btn-show-txt hidden">SHOW LESS</button>
                        </div>

                        <div class="border-top theme-container">
                            <h4 class="card-title">
                            Themes:
                            </h4>
                            <div class="related-tags">
                                <ul class="tags-section">
                                    ${res.tags ?
                                        res.tags.map(tag => {
                                            if(tag.isGeneralSpoiler || tag.isAdult) {
                                                return ''
                                            }
                                            return `<li class="tag" title="${tag.description}">${tag.name}</li>`
                                        }).join(' ')
                                        : 'There seems to be nothing here.'}
                                </ul>
                            </div>
                        </div>

                        <div class="trailer-box border-top border-bottom mb-3">
                            <h4 class="card-title trailer-header">
                                Trailer
                            </h4>
                            <div class="yt-prev">
                                ${res.trailer ? 
                                    `<a href="${res.trailer.site == 'youtube' ? `https://www.youtube.com/watch?v=${res.trailer.id}` : '' }"><img class="yt-thumb" src="${res.trailer.thumbnail ? res.trailer.thumbnail : ''}" alt="Trailer for ${res.title.romaji}"></img></a>` :
                                    'No trailer found.'
                                }
                            </div>
                        </div>
    
                        <div class="external-links">
                            <h5 class="card-title external-links-title">
                                External links
                            </h5>
                            <ul class="links-section">
                            ${res.links ? 
                                `${res.links.map(link => {
                                    let found
                                    externals.forEach(entry => entry.hasOwnProperty(link.site) == true ? found = entry : false)
                                    if(found) {
                                        return `<li><a class="${found[link.site]}" title="${link.site}" href="${link.url}"></a></li>`
                                    }
                                }).join(' ')}` :
                            'No links found.' }
                            </ul>
                        </div>
    
                    </div>
    
    
                </div>
    
        </div>
    
    </div>
    `
    container.insertAdjacentHTML('beforeend', template)
}

