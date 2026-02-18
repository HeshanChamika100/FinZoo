import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripMarkdown(text: string): string {
  if (!text) return ""
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/__(.*?)__/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/_(.*?)_/g, '$1') // Italic
    .replace(/`([^`]+)`/g, '$1') // Code
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Link
    .replace(/^#+\s+/gm, '') // Headings
    .replace(/^-\s+/gm, '') // List items
    .replace(/^\d+\.\s+/gm, '') // Ordered list
    .replace(/\n/g, ' ') // Newlines to spaces
}
