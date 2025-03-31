/* eslint-disable react/display-name */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { Todo } from '../../types/Todo';
import { TodoField } from '../TodoField';

type Props = {
  todos: Todo[];
  deleteTodo: (id: number) => Promise<void>;
  setIsLoadedIDs: (id: number[]) => void;
  isLoadedIDs: number[];
  tempTodo: Todo | null;
  changeCompleted: (todoToChange: Todo) => void;
  changeTodo: (todoToChange: Todo, newTitle: string) => Promise<void>;
};

export const TodoList: React.FC<Props> = ({
  todos,
  deleteTodo,
  isLoadedIDs,
  setIsLoadedIDs,
  tempTodo,
  changeCompleted,
  changeTodo,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoField
          key={todo.id}
          todo={todo}
          deleteTodo={deleteTodo}
          isLoadedIDs={isLoadedIDs}
          setIsLoadedIDs={setIsLoadedIDs}
          changeCompleted={changeCompleted}
          changeTodo={changeTodo}
        />
      ))}

      {tempTodo && (
        <TodoField
          key={tempTodo.id}
          todo={tempTodo}
          isLoadedIDs={[0]}
          setIsLoadedIDs={() => {}}
          changeCompleted={() => {}}
        />
      )}
    </section>
  );
};
