const submit = document.querySelector('.btn.btn-primary').addEventListener('click', saveUser)

function saveUser(e) {
    e.preventDefault()
    const name = document.querySelector('input.form-control')
    console.log(name.value)
    if(name)  {
        localStorage.setItem('user', name.value)
    }
    checkForUser()
}

function checkForUser() {
    const user = localStorage.getItem('user')
    if(user){
        window.location.href ='/'
    }
}
checkForUser()