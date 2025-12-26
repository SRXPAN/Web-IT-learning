import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressPill from '@/components/ProgressPill'

describe('ProgressPill', () => {
  it('renders count and percentage', () => {
    render(<ProgressPill seen={3} total={10} />)
    
    expect(screen.getByText('3/10 • 30%')).toBeInTheDocument()
  })

  it('handles zero total', () => {
    render(<ProgressPill seen={0} total={0} />)
    
    expect(screen.getByText('0/0 • 0%')).toBeInTheDocument()
  })

  it('handles 100% progress', () => {
    render(<ProgressPill seen={5} total={5} />)
    
    expect(screen.getByText('5/5 • 100%')).toBeInTheDocument()
  })

  it('rounds percentage correctly', () => {
    render(<ProgressPill seen={1} total={3} />)
    
    expect(screen.getByText('1/3 • 33%')).toBeInTheDocument()
  })
})
