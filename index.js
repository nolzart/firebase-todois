/*Initialize Firebase */
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // database
const taskForm = document.querySelector('#task-form'); 
const tasksContainer = document.querySelector('#tasks-container');

//Auxiliares
let editStatus = false;
let id = '';


/*Datepicker Initialization*/
const d = new Datepicker(document.getElementById("datepicker"));
const date = new Date();

d.config({
    firstdate: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    lastdate: new Date(2030, 7, 1),
    disableddays: d => {return(d.getDay() >= 0 && d.getDay() <= 7)},
    format: d => {return(months_short[d.getMonth()] + " " + d.getDate() + "," + d.getFullYear())}
});


const saveTask = (title, description, dateFinishTask, stateTask) =>
    db.collection('tasks').doc().set({
        title,
        description,
        dateFinishTask,
        publicationDate: new Date(),
        stateTask,
    });

const getTasks = () => db.collection('tasks').orderBy('dateFinishTask', 'asc').get();
const getSingleTask = id => db.collection('tasks').doc(id).get();
const onGetTasks = (callback) => db.collection('tasks').where('stateTask', '==', 'active').onSnapshot(callback);
const deleteTask = id => db.collection('tasks').doc(id).delete();
const updateTask = (id, updateTask) => db.collection('tasks').doc(id).update(updateTask);

/*State Task */
const getCompleteTasks = () => db.collection('tasks')
        .where('stateTask', '==', 'complete').get();

const getActiveTasks = () => db.collection('tasks')
        .where('stateTask', '==', 'active').get();

const getSuspendedTasks = () => db.collection('tasks')
        .where('stateTask', '==', 'suspended').get();

window.addEventListener('DOMContentLoaded', async (e) => {
    onGetTasks((querySnapshot) => {
        tasksContainer.innerHTML = '';
        tasksContainer.innerHTML = '<h1 class="heading-primary mb-4 text-center divider">Tasks Today</h1><hr />';
        querySnapshot.forEach(doc => {
            if(doc.data().dateFinishTask.toDate().toISOString().split('T')[0]
                == new Date().toISOString().split('T')[0]) {
                markup(doc, 'info')
            }
        });
    });
});

const markup = (doc, color) => {
    const task = doc.data();
    const dateFormat = task.dateFinishTask.toDate();
    task.id = doc.id
    tasksContainer.innerHTML += `
    <div class="card card-body mt-2 border-${color}">
        <h3 class="h5">${task.title}</h3>
        <p>${task.description}</p>
        <div class="dates clearfix">
            <span class="float-left text-info">${moment(task.PublicationDate).format('ll')}</span>
            <span class="float-right text-${color} ">${moment(dateFormat).format('ll')}</span>
        </div>
        <div class="card-footer clearfix">
            <div class="mt-2 float-left">
                <button class="btn btn-danger btn-delete" data-id="${task.id}">Delete</button>
                <button class="btn btn-info btn-edit" data-id="${task.id}">Edit</button>
            </div>
        </div>
    </div>`;

    
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
}

document.querySelector('#complete-tasks').addEventListener('click', async (e) => {
    const querySnapshot = await getCompleteTasks();
    tasksContainer.innerHTML = '';
    tasksContainer.innerHTML = '<h1 class="heading-primary mb-4 text-center divider">Completed Tasks</h1><hr />';
    querySnapshot.forEach(doc => markup(doc, 'success'));
});

document.querySelector('#active-tasks').addEventListener('click', async (e) => {
    const querySnapshot = await getActiveTasks();
    tasksContainer.innerHTML = '';
    tasksContainer.innerHTML = '<h1 class="heading-primary mb-4 text-center divider">Active Tasks</h1><hr />';
    querySnapshot.forEach(doc => markup(doc, 'info'));
});

document.querySelector('#suspended-tasks').addEventListener('click', async (e) => {
    const querySnapshot = await getSuspendedTasks();
    tasksContainer.innerHTML = '';
    tasksContainer.innerHTML = '<h1 class="heading-primary mb-4 text-center divider">Suspended Tasks</h1><hr />';
    querySnapshot.forEach(doc => markup(doc, 'danger'));
});

document.querySelector('#home').addEventListener('click', async (e) => {
    const querySnapshot = await getActiveTasks();
    tasksContainer.innerHTML = '';
    tasksContainer.innerHTML = '<h1 class="heading-primary mb-4 text-center divider">Tasks Today</h1><hr />';
    querySnapshot.forEach(doc => {
        if(doc.data().dateFinishTask.toDate().toISOString().split('T')[0]
            == new Date().toISOString().split('T')[0]) {
            markup(doc, 'info')
        }
    });
})

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = taskForm['task-title'];
    const description = taskForm['task-description'];

    const dateFinishTask = new Date(taskForm['datepicker'].value);

    const stateTask = taskForm['task_state'].value;
    
    if (!editStatus){
        await saveTask(title.value, description.value, dateFinishTask, stateTask);
    } else {
        await updateTask(id, {
            title: title.value,
            description: description.value,
            dateFinishTask,
            publicationDate: new Date(),
            stateTask
        });
        editStatus = false;
        id = '';
        taskForm['btn-save'].innerText = 'Save'
    };

    taskForm.reset();
    title.focus();
});