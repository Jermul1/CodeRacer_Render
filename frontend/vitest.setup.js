import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

export const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Default handlers (can be overridden in tests)
server.use(
  rest.get('https://coderacer-backend.onrender.com/snippets/:language', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ code: 'print("Hello")', language: req.params.language }))
  }),
  rest.get('https://coderacer-backend.onrender.com/snippets', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ languages: ['python', 'javascript'] }))
  }),
  rest.post('https://coderacer-backend.onrender.com/auth/signup', async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'User created successfully', id: 1 }))
  }),
  rest.post('https://coderacer-backend.onrender.com/auth/login', async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Login successful', user_id: 1, username: 'tester' }))
  })
)