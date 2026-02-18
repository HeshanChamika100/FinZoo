"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
   content: string
   className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
   if (!content) return null

   // Split content by newlines to handle paragraphs and lists
   const lines = content.split('\n')

   const renderInline = (text: string) => {
      // Simple inline parsing for **bold** and _italic_
      // We'll split by bold first
      const parts = text.split(/(\*\*.*?\*\*)/g)

      return parts.map((part, index) => {
         if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
            const inner = part.slice(2, -2)
            // Handle italic inside bold? 
            return <strong key={`b-${index}`} className="font-semibold text-foreground">{renderItalic(inner)}</strong>
         }
         return <React.Fragment key={index}>{renderItalic(part)}</React.Fragment>
      })
   }

   const renderItalic = (text: string) => {
      const parts = text.split(/(_.*?_)/g)
      return parts.map((part, index) => {
         if (part.startsWith('_') && part.endsWith('_') && part.length >= 2) {
            return <em key={`i-${index}`} className="italic">{part.slice(1, -1)}</em>
         }
         return part
      })
   }

   return (
      <div className={cn("text-base leading-relaxed space-y-2", className)}>
         {lines.map((line, i) => {
            // List Item
            if (line.trim().startsWith('- ')) {
               return (
                  <div key={i} className="flex items-start gap-2 ml-1">
                     <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                     <span>{renderInline(line.trim().substring(2))}</span>
                  </div>
               )
            }

            // Empty line (paragraph break)
            if (!line.trim()) {
               return <div key={i} className="h-2" />
            }

            // Regular paragraph
            return <div key={i}>{renderInline(line)}</div>
         })}
      </div>
   )
}
