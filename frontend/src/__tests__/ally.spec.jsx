import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import SoloRacePage from '../pages/SoloRacePage.jsx'
import { configureAxe } from 'jest-axe'

const axe = configureAxe()

describe('Accessibility', () => {
	it('SoloRacePage has no critical violations', async () => {
		const { container } = render(<SoloRacePage />)
		const results = await axe(container)
		expect(results.violations.length).toBe(0)
	})
})
