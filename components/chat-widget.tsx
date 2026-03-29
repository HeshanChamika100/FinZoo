"use client"

import React, { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import type { UIMessage } from "ai"

// Helper to extract text content from a UIMessage
function getMessageText(message: UIMessage): string {
  if (!message.parts) return ""
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")
}

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: "greeting",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Hey there! 👋 Welcome to FinZoo! I'm Zooey, your pet buddy. How can I help you today?",
      },
    ],
  },
]

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    id: "finzoo-chat",
    messages: INITIAL_MESSAGES,
  })

  // Prevent hydration mismatch by only rendering on the client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isStreaming = status === "streaming" || status === "submitted"

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const toggleChat = () => {
    setIsOpen((prev) => !prev)
    if (!hasOpened) setHasOpened(true)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = inputValue.trim()
    if (!text || isStreaming) return
    setInputValue("")
    await sendMessage({ text })
  }

  if (!isMounted) return null

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="chat-widget-panel"
          >
            {/* Header */}
            <div className="chat-widget-header">
              <div className="chat-widget-header-info">
                <div className="chat-widget-avatar">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="chat-widget-title">Zooey</h3>
                  <span className="chat-widget-subtitle">FinZoo Assistant</span>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="chat-widget-close-btn"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="chat-widget-messages">
              {messages.map((message) => {
                const text = getMessageText(message)
                if (!text) return null

                return (
                  <div
                    key={message.id}
                    className={`chat-widget-msg ${
                      message.role === "user" ? "chat-widget-msg-user" : "chat-widget-msg-assistant"
                    }`}
                  >
                    <div
                      className={`chat-widget-msg-icon ${
                        message.role === "user"
                          ? "chat-widget-msg-icon-user"
                          : "chat-widget-msg-icon-assistant"
                      }`}
                    >
                      {message.role === "user" ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div
                      className={`chat-widget-msg-bubble ${
                        message.role === "user"
                          ? "chat-widget-msg-bubble-user"
                          : "chat-widget-msg-bubble-assistant"
                      }`}
                    >
                      {text}
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <div className="chat-widget-msg chat-widget-msg-assistant">
                  <div className="chat-widget-msg-icon chat-widget-msg-icon-assistant">
                    <Bot size={14} />
                  </div>
                  <div className="chat-widget-msg-bubble chat-widget-msg-bubble-assistant">
                    <div className="chat-widget-typing">
                      <span className="chat-widget-typing-dot" />
                      <span className="chat-widget-typing-dot" />
                      <span className="chat-widget-typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              {/* Error indicator */}
              {error && (
                <div className="chat-widget-msg chat-widget-msg-assistant mt-2">
                  <div className="chat-widget-msg-icon bg-red-500/10 text-red-500">
                    <Bot size={14} />
                  </div>
                  <div className="chat-widget-msg-bubble bg-red-500/10 text-red-200 border-red-500/20 text-xs">
                    {error.message.includes("429") || error.message.includes("quota")
                      ? "Oops! I'm getting too many messages right now (API rate limit). Please wait a minute and try again!"
                      : "Sorry, I ran into an error connecting to my brain. Please try again later."}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={onSubmit} className="chat-widget-input-area">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="chat-widget-input"
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={isStreaming || !inputValue.trim()}
                className="chat-widget-send-btn"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bubble */}
      <motion.button
        onClick={toggleChat}
        className="chat-widget-bubble"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring when not opened yet */}
        {!hasOpened && (
          <span className="chat-widget-pulse" />
        )}
      </motion.button>
    </>
  )
}
