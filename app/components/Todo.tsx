const res = await fetch(`${process.env.API_URL}/api/todos`, {
  headers: {
    'Content-Type': 'application/json',
  },
  cache: 'no-store',
});

const res = await fetch(`${process.env.API_URL}/api/todos/${id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ completed }),
}); 