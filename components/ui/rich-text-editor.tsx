"use client"

import * as React from "react"
import { Bold, Italic, List, Smile, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover"

interface RichTextEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
   value: string
   onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
   label?: string
}

const COMMON_EMOJIS = [
   "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
   "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "jh", "😚",
   "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
   "🥳", "😏", "😒", "😞", "😔", "ww", "😕", "🙁", "☹️", "😣",
   "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
   "🐶", "🐱", "mouse", "🐹", "🐰", "fox", "🐻", "🐼", "polar_bear", "koala",
   "tiger", "🦁", "cow", "pig", "frog", "🐵", "🙈", "🙉", "🙊", "🐒",
   "🐔", "penguin", "bird", "chick", "duck", "eagle", "owl", "bat", "wolf", "boar",
   "horse", "unicorn", "bee", "bug", "butterfly", "snail", "beetle", "ant", "mosquito", "cricket",
   "spider", "web", "turtle", "snake", "lizard", "t-rex", "sauropod", "octopus", "squid", "shrimp",
   "lobster", "crab", "puffer_fish", "tropical_fish", "fish", "dolphin", "whale", "shark", "seal", "croco"
   // Cleaned up list below to avoid garbage strings
]

const EMOJI_LIST = [
   "😀", "😂", "😍", "🥰", "😎", "🤔", "😊", "😭", "👍", "👎",
   "🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮",
   "🐷", "🐸", "🐵", "🦄", "🐴", "🐔", "🐧", "🐦", "🐤", "🦆",
   "🦅", "🦉", "🦇", "🐺", "🐗", "🐝", "🦋", "🐌", "🐞", "🐜",
   "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀",
   "🐡", "🐠", "🐟", "🐬", "🐳", "🦈", "🐊", "🐅", "🐆", "🦓",
   "🦍", "🦧", "🦣", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘",
   "🐾", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎",
   "✨", "💫", "⭐", "🌟", "🔥", "💥", "💯", "💢", "💦", "💨"
]


export function RichTextEditor({
   value,
   onChange,
   className,
   label,
   id,
   ...props
}: RichTextEditorProps) {
   const textareaRef = React.useRef<HTMLTextAreaElement>(null)

   const insertText = (before: string, after: string = "") => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end)

      // If no text selected, just insert marker at cursor
      // If text selected, wrap it
      const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

      // Create a synthetic event to trigger onChange
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set
      nativeInputValueSetter?.call(textarea, newText)

      const event = new Event("input", { bubbles: true })
      textarea.dispatchEvent(event)

      // Restore focus and selection
      setTimeout(() => {
         textarea.focus()
         textarea.setSelectionRange(start + before.length, end + before.length)
      }, 0)
   }

   const handleBold = () => insertText("**", "**")
   const handleItalic = () => insertText("_", "_")
   const handleList = () => insertText("\n- ")
   const handleEmoji = (emoji: string) => insertText(emoji)

   return (
      <div className={cn("flex flex-col gap-1.5", className)}>
         {label && <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
         <div className="rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b border-border/50 bg-muted/20 p-1">
               <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-sm hover:bg-muted"
                  onClick={handleBold}
                  title="Bold (Markdown)"
               >
                  <Bold className="h-4 w-4" />
                  <span className="sr-only">Bold</span>
               </Button>
               <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-sm hover:bg-muted"
                  onClick={handleItalic}
                  title="Italic (Markdown)"
               >
                  <Italic className="h-4 w-4" />
                  <span className="sr-only">Italic</span>
               </Button>
               <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-sm hover:bg-muted"
                  onClick={handleList}
                  title="Bullet List (Markdown)"
               >
                  <List className="h-4 w-4" />
                  <span className="sr-only">List</span>
               </Button>

               <div className="w-px h-4 bg-border/50 mx-1" />

               <Popover>
                  <PopoverTrigger asChild>
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-sm hover:bg-muted"
                        title="Insert Emoji"
                     >
                        <Smile className="h-4 w-4" />
                        <span className="sr-only">Emoji</span>
                     </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                     <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
                        {EMOJI_LIST.map((emoji) => (
                           <button
                              key={emoji}
                              type="button"
                              className="h-8 w-8 flex items-center justify-center rounded-sm hover:bg-muted text-lg transition-colors"
                              onClick={() => handleEmoji(emoji)}
                           >
                              {emoji}
                           </button>
                        ))}
                     </div>
                  </PopoverContent>
               </Popover>

               <div className="ml-auto text-[10px] text-muted-foreground px-2 select-none">
                  Markdown Supported
               </div>
            </div>

            {/* Textarea */}
            <Textarea
               ref={textareaRef}
               id={id}
               value={value}
               onChange={onChange}
               className="border-0 focus-visible:ring-0 rounded-none rounded-b-md resize-none shadow-none min-h-[120px]"
               {...props}
            />
         </div>
      </div>
   )
}
