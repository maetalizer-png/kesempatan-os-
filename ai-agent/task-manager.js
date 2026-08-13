

const tasks = new Map();

function generateId() {
    return 't_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function createTask(goal, context, options) {
    const task = {
        id: generateId(),
        goal: goal,
        context: context || {},
        options: options || {},
        status: 'IDLE',
        plan: null,
        stepResults: [],
        replanCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    tasks.set(task.id, task);
    return task;
}

function getTask(id) {
    return tasks.get(id) || null;
}

function updateTask(id, patch) {
    const task = tasks.get(id);
    if (!task) return null;
    Object.assign(task, patch, { updatedAt: Date.now() });
    return task;
}

function listTasks() {
    return Array.from(tasks.values());
}

export const TaskManager = Object.freeze({
    createTask: createTask,
    getTask: getTask,
    updateTask: updateTask,
    listTasks: listTasks
});
