/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import cn from 'classnames';
import { Todo } from '../../types/Todo';

type Props = {
  todo: Todo;
  setIsLoadedIDs: (id: number[]) => void;
  isLoadedIDs: number[];
  changeCompleted: (todoToChange: Todo) => void;
  deleteTodo?: (id: number) => Promise<void>;
  changeTodo?: (todoToChange: Todo, newTitle: string) => Promise<void>;
};

export const TodoField: React.FC<Props> = ({
  todo,
  isLoadedIDs,
  setIsLoadedIDs,
  changeCompleted,
  deleteTodo = () => {},
  changeTodo = () => {},
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [todoTitle, setTodoTitle] = useState(todo.title);

  const handleDeleteTodo = (todoId: number) => {
    setIsLoadedIDs([todoId, ...isLoadedIDs]);
    deleteTodo(todoId);
  };

  const handleChangeCompleted = (todoToChange: Todo) => {
    setIsLoadedIDs([todoToChange.id, ...isLoadedIDs]);
    changeCompleted(todoToChange);
  };

  const handleEditTodo = (
    event: React.FormEvent<HTMLFormElement>,
    newTitle: string,
  ) => {
    event.preventDefault();

    if (newTitle.trim() === todo.title) {
      setIsSelected(false);
    }

    setIsLoadedIDs([todo.id, ...isLoadedIDs]);

    if (!newTitle.trim()) {
      deleteTodo(todo.id)
        ?.catch(() => {
          setIsSelected(true);
        })
        .then(() => {
          setIsSelected(false);
        });

      return;
    }

    changeTodo(todo, newTitle.trim())
      ?.catch(() => {
        setIsSelected(true);
      })
      .then(() => {
        setIsSelected(false);
      });
  };

  const handleSelectTodo = () => {
    setIsSelected(true);
  };

  return (
    <div data-cy="Todo" className={cn('todo', { completed: todo.completed })}>
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          defaultChecked={todo.completed}
          onChange={() => handleChangeCompleted(todo)}
        />
      </label>

      {isSelected ? (
        <form
          onBlur={event => handleEditTodo(event, todoTitle)}
          onSubmit={event => handleEditTodo(event, todoTitle)}
          onKeyUp={event => {
            if (event.key === 'Escape') {
              setIsSelected(false);
            }
          }}
        >
          <input
            autoFocus
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={todoTitle}
            onChange={event => setTodoTitle(event.target.value)}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => handleSelectTodo()}
          >
            {todo.title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => handleDeleteTodo(todo.id)}
          >
            ×
          </button>
        </>
      )}

      {/* overlay will cover the todo while it is being deleted or updated */}
      {/* 'is-active' class puts this modal on top of the todo */}
      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active': isLoadedIDs.includes(todo.id),
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
