/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';

enum Status {
  All = 'All',
  Active = 'Active',
  Completed = 'Completed',
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [status, setStatus] = useState(Status.All);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!USER_ID) {
      return;
    }

    let isCancelled = false;

    setErrorMessage('');

    getTodos()
      .then(loadedTodos => {
        if (!isCancelled) {
          setTodos(loadedTodos);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setErrorMessage('Unable to load todos');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setErrorMessage('');
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [errorMessage]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const hasTodos = todos.length > 0;
  const allTodosCompleted = hasTodos && activeTodosCount === 0;

  const visibleTodos = todos.filter(todo => {
    switch (status) {
      case Status.Active:
        return !todo.completed;

      case Status.Completed:
        return todo.completed;

      default:
        return true;
    }
  });

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {hasTodos && (
            <button
              type="button"
              className={classNames('todoapp__toggle-all', {
                active: allTodosCompleted,
              })}
              data-cy="ToggleAllButton"
              aria-label="Toggle all todos"
              disabled
            />
          )}

          <form onSubmit={event => event.preventDefault()}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              disabled
            />
          </form>
        </header>

        {hasTodos && (
          <>
            <section className="todoapp__main" data-cy="TodoList">
              {visibleTodos.map(todo => (
                <div
                  key={todo.id}
                  data-cy="Todo"
                  className={classNames('todo', {
                    completed: todo.completed,
                  })}
                >
                  <label className="todo__status-label">
                    <input
                      data-cy="TodoStatus"
                      type="checkbox"
                      className="todo__status"
                      checked={todo.completed}
                      disabled
                    />
                  </label>

                  <span data-cy="TodoTitle" className="todo__title">
                    {todo.title}
                  </span>

                  <button
                    type="button"
                    className="todo__remove"
                    data-cy="TodoDelete"
                    aria-label="Delete todo"
                    disabled
                  >
                    ×
                  </button>

                  <div data-cy="TodoLoader" className="modal overlay">
                    <div
                      className={classNames(
                        'modal-background',
                        'has-background-white-ter',
                      )}
                    />
                    <div className="loader" />
                  </div>
                </div>
              ))}
            </section>

            <footer className="todoapp__footer" data-cy="Footer">
              <span className="todo-count" data-cy="TodosCounter">
                {activeTodosCount} items left
              </span>

              <nav className="filter" data-cy="Filter">
                <a
                  href="#/"
                  className={classNames('filter__link', {
                    selected: status === Status.All,
                  })}
                  data-cy="FilterLinkAll"
                  onClick={() => setStatus(Status.All)}
                >
                  All
                </a>

                <a
                  href="#/active"
                  className={classNames('filter__link', {
                    selected: status === Status.Active,
                  })}
                  data-cy="FilterLinkActive"
                  onClick={() => setStatus(Status.Active)}
                >
                  Active
                </a>

                <a
                  href="#/completed"
                  className={classNames('filter__link', {
                    selected: status === Status.Completed,
                  })}
                  data-cy="FilterLinkCompleted"
                  onClick={() => setStatus(Status.Completed)}
                >
                  Completed
                </a>
              </nav>

              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
                disabled
              >
                Clear completed
              </button>
            </footer>
          </>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !errorMessage },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          aria-label="Close error notification"
          onClick={() => setErrorMessage('')}
        />

        {errorMessage}
      </div>
    </div>
  );
};
