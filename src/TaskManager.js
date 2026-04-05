import { Task } from "./Task.js";

export class TaskManager {
  constructor() {
    this.tasks = [];
    this.loadTasks();
  }

  addTask(text) {
    const task = new Task(text);
    this.tasks.push(task);
    this.saveTasks();
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    this.saveTasks();
  }

  toggleTask(id) {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      task.completed = !task.completed;
    }
    this.saveTasks();
  }

  clearCompletedTasks() {
    this.tasks = this.tasks.filter((task) => !task.completed);
    this.saveTasks();
  }

  moveTask(fromIndex, toIndex) {
    const [task] = this.tasks.splice(fromIndex, 1);
    this.tasks.splice(toIndex, 0, task);
    this.saveTasks();
  }

  saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  loadTasks() {
    const tasksData = localStorage.getItem("tasks");
    if (tasksData) {
      this.tasks = JSON.parse(tasksData);
    }
  }
}
