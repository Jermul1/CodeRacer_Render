import { describe, it, expect } from 'vitest'
import { getRandomSnippet, getAvailableLanguages, signup, login } from '../api'
import { server } from '../../vitest.setup'
import { rest } from 'msw'

describe('API layer', () => {
  it('fetches a random snippet', async () => {
    const data = await getRandomSnippet('python')
    expect(data.code).toContain('print')
  })

  it('lists available languages', async () => {
    const langs = await getAvailableLanguages()
    expect(langs).toEqual(['python', 'javascript'])
  })

  it('signs up successfully', async () => {
    const res = await signup('u', 'e@example.com', 'pw')
    expect(res.message).toBe('User created successfully')
  })

  it('handles signup error', async () => {
    server.use(
      rest.post('https://coderacer-backend.onrender.com/auth/signup', (req, res, ctx) =>
        res(ctx.status(400), ctx.json({ detail: 'Email already registered' }))
      )
    )
    await expect(signup('u', 'e@example.com', 'pw')).rejects.toBeTruthy()
  })

  it('logs in successfully', async () => {
    const res = await login('e@example.com', 'pw')
    expect(res.username).toBe('tester')
  })
})