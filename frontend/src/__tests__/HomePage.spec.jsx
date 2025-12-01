import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from '../pages/HomePage.jsx'

describe('HomePage', () => {
  it('renders headline and CTA', () => {
    render(<HomePage />)
    expect(screen.getByText(/CodeRacer/i)).toBeInTheDocument()
    const ctas = screen.queryAllByRole('button')
    expect(ctas.length).toBeGreaterThan(0)
  })
})