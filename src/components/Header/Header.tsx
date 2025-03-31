import React from 'react';
import { Todo } from '../../types/Todo';
import cn from 'classnames';
import { NewTodoForm } from '../NewTodoForm';
import { Errors } from '../../types/Errors';

type Props = {
  todos: Todo[];
  addTodo: (title: string) => Promise<void>;
  setNewError: (newErrorMessage: Errors) => void;
  changeAllIsComplated: () => void;
};

export const Header: React.FC<Props> = ({
  todos,
  addTodo,
  setNewError,
  changeAllIsComplated,
}) => {
  return (
    <header className="todoapp__header">
      {todos.length !== 0 && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', {
            active: todos.every(todo => todo.completed),
          })}
          data-cy="ToggleAllButton"
          onClick={() => changeAllIsComplated()}
        />
      )}

      <NewTodoForm addTodo={addTodo} setNewError={setNewError} />
    </header>
  );
};
