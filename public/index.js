//Auxiliares
let editStatus = false;
let id = '';

//FIREBASE CRUD
const saveTask = (title, description, dateFinishTask, stateTask, uid) => {
    db.collection('tasks').doc().set({
        uid,
        title,
        description,
        dateFinishTask,
        publicationDate: new Date(),
        stateTask
    });
}

const getSingleTask = id => db.collection('tasks').doc(id).get();
const deleteTask = id => db.collection('tasks').doc(id).delete();
const updateTask = (id, updateTask) => db.collection('tasks').doc(id).update(updateTask);

/*State Task */
const onGetTasks = (callback, uid) => db.collection('tasks')
    .where('uid', '==', uid)
    .where('stateTask', '==', 'active').onSnapshot(callback);

const onGetCompleteTasks = (callback, uid) => db.collection('tasks')
        .where('uid', '==', uid)
        .where('stateTask', '==', 'complete').onSnapshot(callback);

const onGetActiveTasks = (callback, uid) => db.collection('tasks')
        .where('uid', '==', uid)
        .where('stateTask', '==', 'active').onSnapshot(callback);

const onGetSuspendedTasks = (callback, uid) => db.collection('tasks')
        .where('uid', '==', uid)
        .where('stateTask', '==', 'suspended').onSnapshot(callback);

document.querySelector('#complete-tasks').addEventListener('click', () => {
    const user = auth.currentUser;
    if (user == null){
        elementsDOM.tasksContainer.innerHTML = '';
        document.querySelector('#toast-message').textContent='Login to see your tasks';
        $('.toast').toast('show');
    }
    if (user) onGetCompleteTasks(querySnapshot => renderTasks(querySnapshot, 'completed tasks'), user.uid)
});

document.querySelector('#active-tasks').addEventListener('click', () => {
    const user = auth.currentUser;
    if (user == null){
        elementsDOM.tasksContainer.innerHTML = '';
        document.querySelector('#toast-message').textContent='Login to see your tasks';
        $('.toast').toast('show');
    }
    if (user) onGetActiveTasks(querySnapshot => renderTasks(querySnapshot, 'active tasks'), user.uid);
});

document.querySelector('#suspended-tasks').addEventListener('click', () => {
    const user = auth.currentUser;

    if (user == null){
        elementsDOM.tasksContainer.innerHTML = '';
        document.querySelector('#toast-message').textContent='Login to see your tasks';
        $('.toast').toast('show');
    }

    if (user) onGetSuspendedTasks(querySnapshot => renderTasks(querySnapshot, 'suspended tasks'), user.uid);
});

document.querySelector('#home').addEventListener('click', () => {
    const user = auth.currentUser;
    if (user == null){
        elementsDOM.tasksContainer.innerHTML = '';
        document.querySelector('#toast-message').textContent='Login to see your tasks';
        $('.toast').toast('show');
    }
    if (user) onGetActiveTasks(querySnapshot => {
        elementsDOM.tasksContainer.innerHTML = '';
        elementsDOM.tasksContainer.innerHTML = `<h1 class="heading-primary mb-4 text-center divider">Tasks Today</h1><hr />`;
        querySnapshot.forEach(doc => {
            if(doc.data().dateFinishTask.toDate().toISOString().split('T')[0]
                === new Date().toISOString().split('T')[0]) {
                renderTasksUI(doc, 'info')
            }
        })
    }, user.uid);
})

elementsDOM.taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = elementsDOM.taskForm['task-title'];
    const description = elementsDOM.taskForm['task-description'];

    const dateFinishTask = new Date(elementsDOM.taskForm['datepicker'].value);

    const stateTask = elementsDOM.taskForm['task_state'].value;

    if (!editStatus){
        if (auth.currentUser == null){
            elementsDOM.tasksContainer.innerHTML = '';
            elementsDOM.toast.textContent='Login to see your tasks';
            $('.toast').toast('show');
        } else {
            await saveTask(
                title.value, 
                description.value, 
                dateFinishTask, 
                stateTask,
                firebase.auth().currentUser.uid
            );
        }
    } else {
        await updateTask(id, {
            title: title.value,
            description: description.value,
            dateFinishTask,
            stateTask
        });
        editStatus = false;
        id = '';
        elementsDOM.taskForm['btn-save'].innerText = 'Save'
    };

    elementsDOM.taskForm.reset();
    title.focus();
});

const renderTasks = (querySnapshot, title) => {
    const user = auth.currentUser;

    if (user) {
        elementsDOM.tasksContainer.innerHTML = '';
        elementsDOM.tasksContainer.innerHTML = `<h1 class="heading-primary mb-4 text-center divider">${title}</h1><hr />`;
        querySnapshot.forEach(doc => renderTasksUI(doc))
    }
}

const renderTasksUI = doc => {
    const task = doc.data();
    const dateFormat = task.dateFinishTask.toDate();
    task.id = doc.id;
    let color = task.stateTask === 'active' ? 'info' : task.stateTask === 'complete' ? 'success' : 'danger';

    elementsDOM.tasksContainer.innerHTML += `
    <div class="card card-body mt-2 border-${color} rounded">
        <h3 class="h5">${task.title}</h3>
        <p>${task.description}</p>
        <div class="dates clearfix">
            <span class="float-left text-info">${moment(task.PublicationDate).format('ll')}</span>
            <span class="float-right text-${color} ">${moment(dateFormat).format('ll')}</span>
        </div>
        <div class="card-footer clearfix">
            <div class="mt-2 float-left">
                <button class="btn btn-danger btn-delete rounded" data-id="${task.id}">Delete</button>
                <button class="btn btn-info btn-edit rounded" data-id="${task.id}">Edit</button>
            </div>
        </div>
    </div>`;

    const btnsDelete = document.querySelectorAll('.btn-delete')
    .forEach(btn => {
        btn.addEventListener('click', async (e) => await deleteTask(e.target.dataset.id));
    });

    const btnsEdit = document.querySelectorAll('.btn-edit')
    .forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const doc = await getSingleTask(e.target.dataset.id);
            const task = doc.data();
            editStatus = true;
            id = doc.id;

            elementsDOM.taskForm['task-title'].value = task.title;
            elementsDOM.taskForm['task-description'].value = task.description;
            elementsDOM.taskForm['btn-save'].innerText = 'Update';
        });
    });
}