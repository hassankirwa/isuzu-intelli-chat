import type { Message } from "ai"

const CHAT_HISTORY_KEY = "isuzu_chat_history"

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}

export const saveChatHistory = (sessions: ChatSession[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(sessions))
  }
}

export const loadChatHistory = (): ChatSession[] => {
  if (typeof window !== "undefined") {
    const history = localStorage.getItem(CHAT_HISTORY_KEY)
    return history ? JSON.parse(history) : []
  }
  return []
}

export const saveNewSession = (session: ChatSession) => {
  const history = loadChatHistory()
  history.unshift(session) // Add new session to the beginning of the array
  saveChatHistory(history)
}

export const updateSession = (sessionId: string, messages: Message[]) => {
  const history = loadChatHistory()
  const sessionIndex = history.findIndex((session) => session.id === sessionId)
  if (sessionIndex !== -1) {
    history[sessionIndex].messages = messages
    saveChatHistory(history)
  }
}

export const deleteSession = (sessionId: string) => {
  const history = loadChatHistory()
  const updatedHistory = history.filter((session) => session.id !== sessionId)
  saveChatHistory(updatedHistory)
}

