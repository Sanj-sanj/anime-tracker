const dropdownOptions = document.querySelector('.pull-dropdown').addEventListener('click', pullDropdown)

let toggle = false

function pullDropdown() {
    const options = document.querySelector('.options-area')
    const chevArrowUp = document.querySelector('.bi-chevron-compact-up')
    const chevArrowDown = document.querySelector('.bi-chevron-compact-down')
    if(!toggle) {
        options.classList.add('view-area')
        insertPoint.classList.add('view-area')
        chevArrowDown.classList.remove('show')
        chevArrowUp.classList.add('show')
        return toggle = !toggle
    } 
    if(toggle) {
        options.classList.remove('view-area')
        insertPoint.classList.remove('view-area')
        chevArrowUp.classList.remove('show')
        chevArrowDown.classList.add('show')
        return toggle = !toggle
    }
}