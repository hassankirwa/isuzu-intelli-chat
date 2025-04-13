"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Menu, X, Plus, MessageSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useChat } from "ai/react"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { WelcomeScreen } from "@/components/welcome-screen"
import { motion, AnimatePresence } from "framer-motion"
import { loadChatHistory, saveNewSession, updateSession, deleteSession, type ChatSession } from "@/utils/localStorage"
import { v4 as uuidv4 } from "uuid"
import Image from "next/image"
import { LoginDialog } from "@/components/login-dialog"

// Helper function to create a title from the first message
const createChatTitle = (message: string): string => {
  // Simplify the message to create a title
  const words = message.split(/\s+/).filter((word) => word.length > 2)
  const title = words.slice(0, 4).join(" ")
  return title || "New Chat"
}

export default function IsuzuChat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setInput,
    setMessages,
  } = useChat({
    api: "/api/chat",
    onFinish: (message) => {
      if (currentSessionId) {
        const updatedMessages = [...messages, message]
        updateSession(currentSessionId, updatedMessages)
      }
    },
  })

  // Custom submit handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Don't submit empty messages
    if (!input.trim()) return

    // If this is a new chat, create a new session
    if (messages.length === 0) {
      const newSessionId = uuidv4()
      const title = createChatTitle(input)

      const newSession: ChatSession = {
        id: newSessionId,
        title: title,
        messages: [],
        createdAt: Date.now(),
      }

      saveNewSession(newSession)
      setChatSessions((prev) => [newSession, ...prev])
      setCurrentSessionId(newSessionId)
    }

    // Call the original submit handler
    originalHandleSubmit(e)
  }

  // Load chat history from localStorage on component mount
  useEffect(() => {
    try {
      const history = loadChatHistory()
      setChatSessions(history)
    } catch (error) {
      console.error("Failed to load chat history:", error)
    }
  }, [])

  const handleNewChat = () => {
    setCurrentSessionId(null)
    setMessages([])
  }

  const handleLoadSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      setMessages(session.messages)
    }
  }

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions((prev) => prev.filter((session) => session.id !== sessionId))
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null)
      setMessages([])
    }
    deleteSession(sessionId)
  }

  const handleSuggestionClick = (text: string) => {
    setInput(text)
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar content */}
      <motion.div
        className={cn(
          "fixed md:relative w-[280px] h-full bg-white shadow-lg z-40",
          "transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20%281%29.PNG-yKZz6kaczfTNO25McyrsOvOoduHgXn.png"
              alt="ISUZU Logo"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>

          {/* Chat history */}
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-3">Chat History</h2>
            <div className="space-y-2">
              {chatSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg",
                    currentSessionId === session.id ? "bg-red-100 text-red-800" : "hover:bg-gray-50 text-gray-700",
                  )}
                >
                  <button
                    className="flex-grow text-left text-sm truncate capitalize"
                    onClick={() => handleLoadSession(session.id)}
                    title={session.title} // Show full title on hover
                  >
                    <MessageSquare size={16} className="inline-block mr-2 text-gray-400" />
                    {session.title}
                  </button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteSession(session.id)}>
                    <Trash2 size={16} className="text-gray-400" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* New chat button */}
          <div className="p-4 border-t">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white gap-2" onClick={handleNewChat}>
              <Plus size={18} />
              New Chat
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Car.jpg-8gjvj1GwdaxKMmE5k0jYzLi9QFOIy7.jpeg"
            alt="ISUZU truck in savanna"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Chat header */}
        <div className="relative z-10 p-4 flex justify-between items-center h-16 bg-white/80 backdrop-blur-sm border-b">
          <h1 className="text-xl font-bold text-gray-800">ISUZU IntelliChat 1.0</h1>
          <Button variant="outline" size="sm" onClick={() => setIsLoginDialogOpen(true)}>
            Admin Login
          </Button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat input */}
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
      <LoginDialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />
    </div>
  )
}

