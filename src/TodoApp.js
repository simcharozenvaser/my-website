import { TaskManager } from "./TaskManager.js";
import { loadQuote } from "./QuoteService.js";

export class TodoApp {
  constructor() {
    this.taskManager = new TaskManager();
    this.currentFilter = "all";
    this.currentSearch = "";
    this.searchTimer = null;
    this.draggedTaskId = null;
    this.taskInput = document.querySelector(".js-task-input");
    this.addTaskBtn = document.querySelector(".js-add-task-btn");
    this.taskList = document.querySelector(".js-task-list");
    this.filterBtns = document.querySelectorAll(".js-filter-btn");
    this.clearCompletedBtn = document.querySelector(".js-clear-completed");
    this.searchInput = document.querySelector(".js-search-input");
    this.initEvents();
    this.renderTasks();
    loadQuote();
  }

  initEvents() {
    this.addTaskBtn.addEventListener("click", () => {
      this.handleAddTask();
    });

    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleAddTask();
      }
    });

    this.taskList.addEventListener("click", (e) => {
      if (e.target.classList.contains("task-checkbox")) {
        const id = e.target.getAttribute("data-id");
        this.handleToggleTask(id);
      }
      if (e.target.classList.contains("js-delete-btn")) {
        const id = e.target.getAttribute("data-id");
        this.handleDeleteTask(id);
      }
      if (e.target.classList.contains("js-edit-btn")) {
        const id = e.target.getAttribute("data-id");
        this.handleEditTask(id);
      }
    });

    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.currentFilter = btn.getAttribute("data-filter");
        this.renderWithOptionalReset();
      });
    });

    this.clearCompletedBtn.addEventListener("click", () => {
      this.handleClearCompletedTasks();
    });

    this.searchInput.addEventListener("input", () => {
      this.currentSearch = this.searchInput.value.trim().toLowerCase();
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.renderTasks();
      }, 300);
    });

    this.taskList.addEventListener("dragstart", (e) => {
      const li = e.target.closest(".task-item");
      if (!li) return;
      this.draggedTaskId = li.getAttribute("data-id");
    });

    this.taskList.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    this.taskList.addEventListener("drop", (e) => {
      const li = e.target.closest(".task-item");
      if (!li || !this.draggedTaskId) return;

      const draggedIndex = this.taskManager.tasks.findIndex(
        (task) => task.id === this.draggedTaskId,
      );
      const targetIndex = this.taskManager.tasks.findIndex(
        (task) => task.id === li.getAttribute("data-id"),
      );

      if (
        draggedIndex !== -1 &&
        targetIndex !== -1 &&
        draggedIndex !== targetIndex
      ) {
        this.taskManager.moveTask(draggedIndex, targetIndex);
        this.renderTasks();
      }

      this.draggedTaskId = null;
    });
  }

  renderWithOptionalReset(useAllFilter = false) {
    let tempFilter = this.currentFilter;
    if (useAllFilter) {
      this.currentFilter = "all";
    }
    if (this.currentSearch) {
      this.currentSearch = "";
      this.searchInput.value = "";
    }
    this.renderTasks();
    this.currentFilter = tempFilter;
  }

  renderTasks(filter = this.currentFilter, search = this.currentSearch) {
    this.taskList.innerHTML = "";

    if (search) {
      filter = "all";
    }

    this.taskManager.tasks.forEach((task) => {
      const showTask =
        filter === "all" ||
        (filter === "completed" && task.completed) ||
        (filter === "active" && !task.completed);
      if (!showTask) return;

      if (search && !task.text.toLowerCase().includes(search)) return;

      const taskItem = document.createElement("li");
      taskItem.className = "task-item";
      taskItem.setAttribute("draggable", "true");
      taskItem.setAttribute("data-id", task.id);
      taskItem.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} data-id="${task.id}" />
          <span class="${task.completed ? "completed" : ""}">
  ${task.text}
</span>
<button class="edit-btn js-edit-btn" data-id="${task.id}">✎<span class="tooltip">Edit</span></button>
        </div>
        <button class="delete-btn js-delete-btn" data-id="${task.id}">🗑
        <span class="tooltip">Delete</span></button>
      `;
      this.taskList.appendChild(taskItem);
    });

    if(this.taskManager.tasks.length === 0) {
      this.taskList.innerHTML = `<li class="empty-state">No tasks yet. Add your first task!</li>`;
    }
    this.updateFilterCounts();
  }

  handleAddTask() {
    const text = this.taskInput.value.trim();
    if (text) {
      this.taskManager.addTask(text);
      this.renderWithOptionalReset(true);
      this.taskInput.value = "";
    }
  }

  handleDeleteTask(id) {
    this.taskManager.deleteTask(id);
    this.renderTasks();
  }

  handleToggleTask(id) {
    this.taskManager.toggleTask(id);
    this.renderTasks();
  }

  handleClearCompletedTasks() {
    this.taskManager.clearCompletedTasks();
    this.renderTasks();
  }

  handleEditTask(id) {
    const task = this.taskManager.tasks.find((task) => task.id === id);
    if (!task) return;

    console.log("Editing Task:", task);

    const taskItem = this.taskList.querySelector(`.task-item[data-id="${id}"]`);
    console.log("Task Item Element:", taskItem);
    const textSpan = taskItem.querySelector(".task-left span");

    const originalText = task.text;

    const input = document.createElement("input");
    input.type = "text";
    input.value = originalText;
    input.className = "edit-input";
    console.log("Created Input Element:", input);
    textSpan.replaceWith(input);
    input.focus();

    const cancelEdit = () => {
      input.replaceWith(textSpan);
      task.text = originalText;
      this.renderTasks();
    };

    const saveEdit = () => {
      const newText = input.value.trim();
      if (newText) {
        task.text = newText;
        this.taskManager.saveTasks();
      }
      this.renderTasks();
    };

    input.addEventListener("blur", saveEdit);

    input.addEventListener("keydown", (e) => {
      console.log("Key Pressed:", e.key);
      if (e.key === "Enter") saveEdit();
      if (e.key === "Escape") cancelEdit();
    });
  }

  updateFilterCounts() {
    const tasks = this.taskManager.tasks;
    const allCount = tasks.length;
    const completedCount = tasks.filter((task) => task.completed).length;
    const activeCount = allCount - completedCount;

    if (completedCount > 0) {
      this.clearCompletedBtn.style.display = "block";
    } else {
      this.clearCompletedBtn.style.display = "none";
    }

    this.filterBtns.forEach((btn) => {
      const filter = btn.getAttribute("data-filter");
      if (filter === "all") {
        btn.textContent = `All (${allCount})`;
      } else if (filter === "completed") {
        btn.textContent = `Completed (${completedCount})`;
      } else if (filter === "active") {
        btn.textContent = `Active (${activeCount})`;
      }
    });
  }
}
