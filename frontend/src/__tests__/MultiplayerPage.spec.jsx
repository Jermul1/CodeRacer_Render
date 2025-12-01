import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MultiplayerPage from '../pages/MultiplayerPage.jsx'

describe('MultiplayerPage', () => {
  it('renders lobby and controls', () => {
    render(<MultiplayerPage />)
    expect(screen.getByText(/Lobby|Room|Multiplayer/i)).toBeInTheDocument()
  })
})