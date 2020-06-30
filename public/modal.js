elementsDOM.registerBtn.addEventListener('click', () => {
    const condition = elementsDOM.modalTitle.textContent === 'login';

    elementsDOM.modalTitle.textContent = condition ? 'register' : 'login';
    elementsDOM.loginBtn.textContent = condition ? 'register' : 'login';
    elementsDOM.registerBtn.textContent = condition ? 'login' : 'register';
});

elementsDOM.loginIcon.addEventListener('click', () => {
    elementsDOM.logoutBtn.style.display = firebase.auth().currentUser ? 'block' : 'none';
    elementsDOM.modalTitle.textContent = firebase.auth().currentUser ? 'You are logged!' : 'login';
    ['login__btn', 'register__btn', 'login__google', 
    'login__facebook', 'login__email', 'login__password'].forEach(cur => document.querySelector(`#${cur}`).style.display = firebase.auth().currentUser ? 'none' : 'block');
});

/*FIREBASE AUTHENTICATION */
elementsDOM.loginBtn.addEventListener('click', (e) => {
    const email = document.querySelector("#login__email").value;
    const password = document.querySelector("#login__password").value;
    
    elementsDOM.modalTitle.textContent === 'login' 
    ? signInAccountWithEmail(email, password)
    : registerAccountWithEmail(email, password);
});

elementsDOM.logoutBtn.addEventListener('click', async () => {
    try {
        await firebase.auth().signOut()
        elementsDOM.toast.textContent = 'Bye bye!!!'
        $('.modal').modal('hide');
        $('.toast').toast('show');
    } catch(error) {
        elementsDOM.toast.textContent=`${error.message}`;
        $('.toast').toast('show');
    }
    
});

elementsDOM.loginGoogleBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider()

    try {
        const result = await firebase.auth().signInWithPopup(provider);
        const user = saveUser(result.user.email);
        elementsDOM.toast.textContent=`Welcome ${result.user.email}`;
        $('.modal').modal('hide');
        $('.toast').toast('show');
    } catch(error) {
        elementsDOM.toast.textContent=`${error.message}`;
        $('.toast').toast('show');
    }
});

elementsDOM.loginFacebookBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.FacebookAuthProvider();

    try {
        const result = await firebase.auth().signInWithPopup(provider);
        const user = saveUser(result.user.email);
        elementsDOM.toast.textContent=`Welcome ${result.user.email}`;
        $('.toast').toast('show');
        $('.modal').modal('hide');
    } catch(error) {
        elementsDOM.toast.textContent=`${error.message}`;
        $('.toast').toast('show');
    }
});

const saveUser = async (email) => {
    await db.collection('users').add({
        email,
    })
}

const registerAccountWithEmail = async (email, password) => {
    try { 
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = saveUser(email, password);
        const configuration = {
            url: 'http://127.0.0.1:8080/'
        };
        await result.user.sendEmailVerification(configuration);
        firebase.auth().signOut();
        elementsDOM.toast.textContent='You have successfully registered, verify your account';
        $('.toast').toast('show');
        $('.modal').modal('hide');
    } catch(error) {
        elementsDOM.toast.textContent=`${error.message}`;
        $('.toast').toast('show');
    }
    
}

const signInAccountWithEmail = async (email, password) => {
    try {
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        if(result.user.emailVerified) {
            elementsDOM.toast.textContent=`Welcome ${result.user.email}`;
        } else {
            firebase.auth().signOut();
            toast.textContent='Please complete the account verification process';
        }
        $('.toast').toast('show');
        $('.modal').modal('hide');
    } catch (error) {
        
        elementsDOM.toast.textContent=`${error.message}`;
        $('.toast').toast('show');
    }
    
}