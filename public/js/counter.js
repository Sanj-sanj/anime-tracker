const timer = countingFunc()
let showCountdown

function countingFunc() {
    let called = 0
    let stringCounter 
    let arr = []
    let cdArr = []
    function countdown (nextEp) {
        showCountdown = setInterval(() => {
            if(nextEp == "Finished") {
                arr.push('Finished')
                if(arr.length == called) {
                    displayTime(arr)
                    arr= []
                }
                return
            }
            if(isNaN(nextEp)) { 
                arr.push('No information')
                if(arr.length == called) {
                    displayTime(arr)
                    arr= []
                }
                return 
            }
            const now = new Date().getTime()
            const timeApart = nextEp - now
            if(timeApart < 0) {
                arr.push('Released!')
                if(arr.length == called) {
                    displayTime(arr)
                    arr = []
                }
                return
            }
            const days = Math.floor(timeApart / (1000 * 60 * 60 * 24))
            const hours = Math.floor((timeApart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((timeApart % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((timeApart % (1000 * 60)) / 1000)
            stringCounter = `${days}d ${hours}h ${minutes < 10 ? '0' : ''}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`
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
function createCountdowns(arr, cd) {
    if(arr) {
        arr.forEach(item => {
            if(!Number(item.cd)) {
                timer.timesCalled()
                timer.countdown(item.cd)
                return
            }
            const nextEp = new Date()
            nextEp.setMilliseconds(item.cd)
            timer.timesCalled()
            timer.countdown(nextEp)
        })
    }
    const nextEp = new Date()
    
    nextEp.setSeconds(cd)
    timer.timesCalled()
    timer.countdown(nextEp)
}
