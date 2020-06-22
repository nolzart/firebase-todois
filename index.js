firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // database
const taskForm = document.querySelector('#task-form'); 
const tasksContainer = document.querySelector('#tasks-container');

//Auxiliares
let editStatus = false;
let id = '';

const saveTask = (title, description) => 
    db.collection('tasks').doc().set({
        title,
        description
    });

const getTasks = () => db.collection('tasks').get();
const getSingleTask = id => db.collection('tasks').doc(id).get();
const onGetTasks = (callback) => db.collection('tasks').onSnapshot(callback);
const deleteTask = id => db.collection('tasks').doc(id).delete();

const updateTask = (id, updateTask) => db.collection('tasks').doc(id).update(updateTask);

window.addEventListener('DOMContentLoaded', async (e) => {
    onGetTasks((querySnapshot) => {
        tasksContainer.innerHTML = '';
        querySnapshot.forEach(doc => {
            const task = doc.data();
            task.id = doc.id;

            tasksContainer.innerHTML += `
            <div class="card card-body mt-2 border-primary">
                <h3 class="h5">${task.title}</h3>
                <p>${task.description}</p>
                <div>
                    <button class="btn btn-danger btn-delete" data-id="${task.id}">Delete</button>
                    <button class="btn btn-info btn-edit" data-id="${task.id}">Edit</button>
                </div>
            </div>
            `;

            const btnsDelete = document.querySelectorAll('.btn-delete')
                .forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        await deleteTask(e.target.dataset.id);
                    });
                });

            const btnsEdit = document.querySelectorAll('.btn-edit')
            .forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const doc = await getSingleTask(e.target.dataset.id);
                    const task = doc.data();

                    editStatus = true;
                    id = doc.id;

                    taskForm['task-title'].value = task.title;
                    taskForm['task-description'].value = task.description;
                    taskForm['btn-save'].innerText = 'Update';
                });
            });
        });
    });
});

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskForm['task-title'];
    const description = taskForm['task-description'];

    if (!editStatus){
        await saveTask(title.value, description.value);
    } else {
        await updateTask(id, {
            title: title.value,
            description: description.value
        });

        editStatus = false;
        id = '';
        taskForm['btn-save'].innerText = 'Save'
    };

    taskForm.reset();
    title.focus();
});