import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Todo from './Todo';

test('renders todo text', () => {
  const todo = { text: 'Learn Docker', done: false };
  render(<Todo todo={todo} deleteTodo={() => {}} completeTodo={() => {}} />);
  expect(screen.getByText('Learn Docker')).toBeInTheDocument();
});
