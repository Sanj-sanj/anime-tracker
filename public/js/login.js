const submit = document.querySelector('.btn.btn-primary').addEventListener('click', saveUser)

function saveUser() {
    const name = document.querySelector('input.form-control')
    console.log(name.value)
    if(name)  {
        localStorage.setItem('user', name.value)
    }
}

function checkForUser() {
    const user = localStorage.getItem('user')
    if(user){
        window.location.href ='/'
    }
}
checkForUser()