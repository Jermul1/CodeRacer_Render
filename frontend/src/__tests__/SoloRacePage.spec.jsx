import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import SoloRacePage from '../pages/SoloRacePage.jsx'
import { server } from '../../vitest.setup'
import { rest } from 'msw'

describe('SoloRacePage', () => {
  it('shows snippet when loaded', async () => {
    server.use(
      rest.get('https://coderacer-backend.onrender.com/snippets/python', (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ code: 'def fib(n): pass', language: 'python' }))
      )
    )
    render(<SoloRacePage />)
    await waitFor(() => {
      expect(screen.getByText(/fib/)).toBeInTheDocument()
    })
  })

  it('shows fallback snippet on error', async () => {
    server.use(
      rest.get('https://coderacer-backend.onrender.com/snippets/python', (req, res, ctx) =>
        res(ctx.status(500))
      )
    )
    render(<SoloRacePage />)
    await waitFor(() => {
      expect(screen.getByText(/fallback/i)).toBeTruthy
    })
  })
})