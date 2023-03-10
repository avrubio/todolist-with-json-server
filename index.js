//console.log("hello world")

/* 
  client side
    template: static template
    logic(js): MVC(model, view, controller): used to server side technology, single page application
        model: prepare/manage data,
        view: manage view(DOM),
        controller: business logic, event bindind/handling

  server side
    json-server
    CRUD: create(post), read(get), update(put, patch), delete(delete)


*/

//read
/* fetch("http://localhost:3000/todos")
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    }); */
const customFetch = (url, options) => {
  return fetch(url, options).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  });
};

const APIs = (() => {
  const createTodo = (newTodo) => {
    const options = {
      method: "POST",
      body: JSON.stringify(newTodo),
      headers: { "Content-Type": "application/json" },
    };
    return customFetch("http://localhost:3000/todos", options);
  };

  const deleteTodo = (id) => {
    const options = {
      method: "DELETE",
    };
    return customFetch(`http://localhost:3000/todos/${id}`, options);
  };

  const getTodos = () => {
    const options = {
      method: "GET",
    };
    return customFetch("http://localhost:3000/todos", options);
  };

  const updateTodo = (id, updatedTodo) => {
    const options = {
      method: "PATCH",
      body: JSON.stringify(updatedTodo),
      headers: { "Content-Type": "application/json" },
    };
    return customFetch(`http://localhost:3000/todos/${id}`, options);
  };

  return { createTodo, deleteTodo, getTodos, updateTodo };
})();

//IIFE
//todos
/* 
    hashMap: faster to search
    array: easier to iterate, has order


*/
const Model = (() => {
  class State {
    #todos; //private field
    #onChange; //function, will be called when setter function todos is called
    constructor() {
      this.#todos = [];
    }
    get todos() {
      return this.#todos;
    }
    set todos(newTodos) {
      // reassign value
      console.log("setter function");
      this.#todos = newTodos;
      this.#onChange?.(); // rendering
    }

    subscribe(callback) {
      //subscribe to the change of the state todos
      this.#onChange = callback;
    }
  }
  const { getTodos, createTodo, deleteTodo, updateTodo } = APIs;
  return {
    State,
    getTodos,
    createTodo,
    deleteTodo,
    updateTodo,
  };
})();
/* 
    todos = [
        {
            id:1,
            content:"eat lunch"
        },
        {
            id:2,
            content:"eat breakfast"
        }
    ]

*/
const View = (() => {
  const todolistEl = document.querySelector(".todo-list");
  const submitBtnEl = document.querySelector(".submit-btn");
  const inputEl = document.querySelector(".input");

  const renderTodos = (todos) => {
    let todosTemplate = "";
    todos.forEach((todo) => {
      const liTemplate = `<li><span contenteditable="false">${todo.content}</span><button class="delete-btn" id="${todo.id}"><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg> </button><button class="edit-btn" id="${todo.id}"> <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24"  aria-label="fontSize small"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg> </button><button class="move-right-btn" id="${todo.id}"><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIcon" aria-label="fontSize small"><path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg></button></li><div class="task-box"></div>`;
      todosTemplate += liTemplate;
    });
    if (todos.length === 0) {
      todosTemplate = "<h4>no task to display!</h4>";
    }
    todolistEl.innerHTML = todosTemplate;
  };

  const clearInput = () => {
    inputEl.value = "";
  };

  return {
    renderTodos,
    submitBtnEl,
    inputEl,
    clearInput,
    todolistEl,
  };
})();

const Controller = ((view, model) => {
  const state = new model.State();
  const init = () => {
    model.getTodos().then((todos) => {
      todos.reverse();
      state.todos = todos;
    });
  };

  const handleSubmit = () => {
    view.submitBtnEl.addEventListener("click", (event) => {
      /* 
                1. read the value from input
                2. post request
                3. update view
            */
      const inputValue = view.inputEl.value;
      model.createTodo({ content: inputValue }).then((data) => {
        state.todos = [data, ...state.todos];
        view.clearInput();
      });
    });
  };

  const handleDelete = () => {
    //event bubbling
    /* 
            1. get id
            2. make delete request
            3. update view, remove
        */
    view.todolistEl.addEventListener("click", (event) => {
      if (event.target.className === "delete-btn") {
        const id = event.target.id;
        console.log("id", typeof id);
        model.deleteTodo(+id).then((data) => {
          state.todos = state.todos.filter((todo) => todo.id !== +id);
        });
      }
    });
  };

  const handleMoveRight = () => {
    view.todolistEl.addEventListener("click", (event) => {
      if (event.target.className === "move-right-btn") {
        const id = event.target.id;
        const taskEl = event.target.parentNode.firstChild;
        const boxEl = event.target
          .closest(".app")
          .nextElementSibling.querySelector(".todo-list");
        boxEl.appendChild(taskEl.parentNode);
        model.updateTodo(id, { content }).then((data) => {
          state.todos = state.todos.map((todo) => {
            if (todo.id === +id) {
              return data;
            }
            return todo;
          });
        });
      }
    });
  };

  const handleEdit = () => {
    view.todolistEl.addEventListener("click", (event) => {
      console.log("edit this bitch");
      const target = event.target;
      if (target.classList.contains("edit-btn")) {
        const span = target.parentNode.querySelector("span");
        span.contentEditable = true;
        span.focus();
        span.addEventListener("blur", () => {
          span.contentEditable = false;
          const id = target.id;
          const content = span.innerText;
          model.updateTodo(id, { content }).then((data) => {
            state.todos = state.todos.map((todo) => {
              if (todo.id === +id) {
                return data;
              }
              return todo;
            });
          });
        });
      }
    });
  };

  const bootstrap = () => {
    init();
    handleSubmit();
    handleDelete();
    handleEdit();
    handleMoveRight();
    state.subscribe(() => {
      view.renderTodos(state.todos);
    });
  };
  return {
    bootstrap,
  };
})(View, Model); //ViewModel

Controller.bootstrap();
