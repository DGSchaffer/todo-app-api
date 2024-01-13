const addTodoBtn = document.querySelector("#new-todo-btn");
const removeBtn = document.querySelector("#removedone");
const todoList = document.querySelector("#list");
const headerTodos = document.getElementById("yourtodos");
const uniCheck = document.querySelector("#check");
const checkAll = document.getElementById("universal-check");
const inputTodo = document.querySelector("#new-todo");
const url = "http://localhost:4730/todos/";

const todos = [];

loadTodos();

addTodoBtn.addEventListener("click", addTodo);
todoList.addEventListener("change", updateTodo);
removeBtn.addEventListener("click", removeTodo);
checkAll.addEventListener("change", toggle);

// load state from Backend:
function loadTodos() {
  fetch(url)
    .then((res) => res.json())
    .then((todosFromApi) => {
      //save to local state:
      todos.push(...todosFromApi);
      renderTodos();
    });
}

//RENDER HTML ELEMENTS:
function renderTodos() {
  todoList.innerHTML = "";
  inputTodo.value = "";

  for (const todo of todos) {
    if (todo.id) {
      const newLi = document.createElement("li");
      newLi.id = todo.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = todo.id;
      checkbox.checked = todo.done;
      checkbox.todoObj = todo;
      checkbox.name = "cb";

      const description = document.createElement("label");
      description.htmlFor = checkbox.id;
      description.innerText = todo.description;

      newLi.append(checkbox, description);
      todoList.append(newLi);
    }

    // Change styles when todo is checked:
    if (checkbox.checked === true) {
      newLi.style.textDecoration = "line-through";
      checkbox.style.backgroundColor = "#06d6a0";
    } else {
      newLi.style.textDecoration = "none";
      checkbox.style.backgroundColor = "#ffffff";
    }
  }
}

// SELECT ALL CHECKBOXES AT ONCE:
function toggle() {
  const checkboxes = document.getElementsByName("cb");
  for (let i = 0, n = checkboxes.length; i < n; i++) {
    checkboxes[i].checked = checkAll.checked;
  }
}

// ADD NEW TODO:
function addTodo() {
  const todoDescription = document.querySelector("#new-todo");
  const newTodoText = todoDescription.value;
  headerTodos.classList.remove("hidden");
  uniCheck.classList.remove("hidden");
  if (inputTodo.value.length < 4) {
    alert("length must be a minimum 4 characters");
    inputTodo.value = "";
    return;
  }
  const newTodo = {
    description: newTodoText,
    done: false,
  };
  todos.push(newTodo);
  renderTodos();

  fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },

    body: JSON.stringify(newTodo),
  })
    .then((res) => res.json())
    .then((newTodoFromAPI) => {
      console.log("Response from server (addTodo):", newTodoFromAPI);
      todos.push(newTodoFromAPI);
    });
}

// USE ENTER KEY FOR SUBMIT:
const enter = document.getElementById("new-todo");
enter.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTodoBtn.click(addTodo);
  }
});

// UPDATE TODO WHEN CHECKBOX IS CHECKED:
function updateTodo(e) {
  const updatedCheckbox = e.target;
  const updatedTodo = updatedCheckbox.todoObj;
  const todoId = updatedTodo.id;

  updatedTodo.done = !updatedTodo.done;

  fetch(url + todoId, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },

    body: JSON.stringify({
      done: updatedCheckbox.checked,
      description: updatedTodo.description,
    }),
  })
    .then((res) => res.json())
    .then((newTodoFromAPI) => {
      console.log("Response from server (updateTodo):", newTodoFromAPI);
      const index = todos.findIndex((todo) => todo.id === newTodoFromAPI.id);
      if (index !== -1) {
        todos[index] = { ...todos[index], done: newTodoFromAPI.done };
        // renderTodos();
        // console.log(todos);
      }
    });
}

//REMOVE DONE TODOS:
function removeTodo() {
  const checkedCheckboxes = document.querySelectorAll(
    'input[type="checkbox"]:checked'
  );

  checkedCheckboxes.forEach((checkbox) => {
    const todoId = checkbox.id;

    fetch(url + todoId, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        todos.splice(
          todos.findIndex((todo) => todo.id === todoId),
          1
        );
        renderTodos();
      });
  });

  if ((todoList.value = "")) {
    headerTodos.classList.add("hidden");
  }
}

//FILTER TODOS :

const allTodos = document.querySelector("#all");
const openTodos = document.querySelector("#open");
const doneTodos = document.querySelector("#done");

allTodos.addEventListener("change", filteredTodos);
doneTodos.addEventListener("change", filteredTodos);
openTodos.addEventListener("change", filteredTodos);

function filteredTodos(e) {
  const checkbox = e.target;

  if (checkbox.id === "all") {
    // Show all todos
    todos.forEach((todo) => {
      const listItem = document.getElementById(todo.id);
      listItem.classList.remove("hidden");
    });
  } else if (checkbox.id === "open") {
    // Show only open todos
    todos.forEach((todo) => {
      const listItem = document.getElementById(todo.id);
      if (!todo.done) {
        listItem.classList.remove("hidden");
      } else {
        listItem.classList.add("hidden");
      }
    });
  } else if (checkbox.id === "done") {
    // Show only done todos
    todos.forEach((todo) => {
      const listItem = document.getElementById(todo.id);
      if (todo.done === true) {
        listItem.classList.remove("hidden");
      } else {
        listItem.classList.add("hidden");
      }
    });
  }
}
