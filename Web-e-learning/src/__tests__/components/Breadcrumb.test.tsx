import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import Breadcrumb from '@/components/Breadcrumb'

describe('Breadcrumb', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders single item', () => {
    render(<Breadcrumb items={[{ label: 'Home', current: true }]} />)
    
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('renders multiple items with separators', () => {
    render(
      <Breadcrumb 
        items={[
          { label: 'Home', onClick: () => {} },
          { label: 'Products', onClick: () => {} },
          { label: 'Item', current: true },
        ]} 
      />
    )
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Item')).toBeInTheDocument()
  })

  it('renders current item without link', () => {
    render(
      <Breadcrumb 
        items={[
          { label: 'Home', onClick: () => {} },
          { label: 'Current', current: true },
        ]} 
      />
    )
    
    const current = screen.getByText('Current')
    expect(current.tagName).toBe('SPAN')
    expect(current).toHaveClass('font-medium')
  })

  it('renders clickable items as buttons', () => {
    const onClick = vi.fn()
    render(
      <Breadcrumb 
        items={[
          { label: 'Clickable', onClick },
          { label: 'Current', current: true },
        ]} 
      />
    )
    
    const button = screen.getByRole('button', { name: 'Clickable' })
    expect(button).toBeInTheDocument()
  })
})
