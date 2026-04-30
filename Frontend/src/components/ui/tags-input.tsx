import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface Props {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export function TagsInput({ value, onChange, placeholder = 'Type and press Enter', className }: Props) {
  const [input, setInput] = useState('')

  function add() {
    const tag = input.trim()
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setInput('')
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-10', className)}>
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-sm rounded-md"
        >
          {tag}
          <button type="button" onClick={() => remove(tag)} className="hover:text-destructive">
            <X size={12} />
          </button>
        </span>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ''}
        className="border-0 shadow-none focus-visible:ring-0 h-auto p-0 flex-1 min-w-24 text-sm"
      />
    </div>
  )
}
