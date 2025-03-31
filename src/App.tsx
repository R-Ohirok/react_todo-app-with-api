/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
// import { UserWarning } from './UserWarning';
import * as todoServices from './api/todos';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList';
import { FilterBy } from './types/FilterBy';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Errors } from './types/Errors';
import { ErrorNotification } from './components/ErrorNotification';

function filterTodos(todos: Todo[], show: string) {
  switch (show) {
    case FilterBy.Active: {
      return todos.filter(todo => !todo.completed);
    }

    case FilterBy.Completed: {
      return todos.filter(todo => todo.completed);
    }

    case FilterBy.All:

    default:
      return todos;
  }
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState(Errors.No_Error);
  const [filterBy, setFilterBy] = useState(FilterBy.All);
  const [isLoadedIDs, setIsLoadedIDs] = useState<number[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const isFocusAddForm = useRef(false);

  useEffect(() => {
    isFocusAddForm.current = false;
  });

  const timerId = useRef(0);

  const changeErrorMesssage = (newErrorMessage: Errors) => {
    window.clearTimeout(timerId.current);

    setErrorMessage(newErrorMessage);
    timerId.current = window.setTimeout(
      () => setErrorMessage(Errors.No_Error),
      3000,
    );
  };

  useEffect(() => {
    todoServices
      .getTodos()
      .then(todosFromServer => {
        setTodos(todosFromServer);
      })
      .catch(() => {
        changeErrorMesssage(Errors.Load);
      });
  }, []);

  const filteredTodos = filterTodos(todos, filterBy);

  const handleDeleteTodo = (todoId: number) => {
    return todoServices
      .deleteTodo(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(error => {
        changeErrorMesssage(Errors.Delete);
        throw new Error(error);
      })
      .finally(() => {
        setIsLoadedIDs((loadingIDs: number[]) => {
          const stilLoadingIDs = loadingIDs;

          stilLoadingIDs.pop();

          return stilLoadingIDs;
        });
        isFocusAddForm.current = true;
      });
  };

  const handleDeleteCompletedTodo = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    completedTodos.forEach(todo => {
      setIsLoadedIDs((alreadyLoadedIDs: number[]) => [
        ...alreadyLoadedIDs,
        todo.id,
      ]);
      handleDeleteTodo(todo.id);
    });
  };

  const handleAddTodo = (todoTitle: string) => {
    const newTodoToAdd = {
      userId: todoServices.USER_ID,
      title: todoTitle.trim(),
      completed: false,
      id: 0,
    };

    setTempTodo(newTodoToAdd);
    setErrorMessage(Errors.No_Error);

    return todoServices
      .addTodo(newTodoToAdd)
      .then(newTodo => {
        setTodos(currentTodos => [...currentTodos, newTodo]);
      })
      .catch(error => {
        changeErrorMesssage(Errors.Add);
        throw error;
      })
      .finally(() => {
        setTempTodo(null);
        isFocusAddForm.current = true;
      });
  };

  const handleChangeCompleted = (todoToChange: Todo) => {
    const changedTodo = { ...todoToChange, completed: !todoToChange.completed };

    todoServices
      .updateTodo(changedTodo)
      .then(updatedTodo => {
        setTodos(currentTodos => {
          return currentTodos.map(todo =>
            todo.id === updatedTodo.id ? updatedTodo : todo,
          );
        });
      })
      .catch(() => {
        changeErrorMesssage(Errors.Update);
      })
      .finally(() => {
        setIsLoadedIDs((loadingIDs: number[]) => {
          const stilLoadingIDs = loadingIDs;

          stilLoadingIDs.pop();

          return stilLoadingIDs;
        });
      });
  };

  const handleChangeAllIsCompleted = () => {
    if (todos.every(todo => todo.completed)) {
      todos.forEach(todo => {
        setIsLoadedIDs((alreadyLoadedIDs: number[]) => [
          ...alreadyLoadedIDs,
          todo.id,
        ]);
        handleChangeCompleted(todo);
      });

      return;
    }

    const uncompletedTodos = todos.filter(todo => !todo.completed);

    uncompletedTodos.forEach(todo => {
      setIsLoadedIDs((alreadyLoadedIDs: number[]) => [
        ...alreadyLoadedIDs,
        todo.id,
      ]);
      handleChangeCompleted(todo);
    });
  };

  const handleChangeTodo = (todoToChange: Todo, newTodoTitle: string) => {
    const changedTodo = { ...todoToChange, title: newTodoTitle };

    return todoServices
      .updateTodo(changedTodo)
      .then(updatedTodo => {
        setTodos(currentTodos => {
          return currentTodos.map(todo =>
            todo.id === updatedTodo.id ? updatedTodo : todo,
          );
        });
      })
      .catch(error => {
        changeErrorMesssage(Errors.Update);
        throw new Error(error);
      })
      .finally(() => {
        setIsLoadedIDs((loadingIDs: number[]) => {
          const stilLoadingIDs = loadingIDs;

          stilLoadingIDs.pop();

          return stilLoadingIDs;
        });
      });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          addTodo={handleAddTodo}
          setNewError={changeErrorMesssage}
          changeAllIsComplated={handleChangeAllIsCompleted}
          isFocusAddForm={isFocusAddForm.current}
        />

        <TodoList
          todos={filteredTodos}
          deleteTodo={handleDeleteTodo}
          isLoadedIDs={isLoadedIDs}
          setIsLoadedIDs={setIsLoadedIDs}
          tempTodo={tempTodo}
          changeCompleted={handleChangeCompleted}
          changeTodo={handleChangeTodo}
        />

        {todos.length !== 0 && (
          <Footer
            todos={todos}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            deleteCompleted={handleDeleteCompletedTodo}
          />
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        timerId={timerId}
      />
    </div>
  );
};
