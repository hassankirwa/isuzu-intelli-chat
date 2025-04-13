"use client"

import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type React from "react"

interface ChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) {
        handleSubmit(new SubmitEvent("submit", { cancelable: true }) as unknown as React.FormEvent<HTMLFormElement>)
      }
    }
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="sticky bottom-0 z-10 p-4 bg-white/80 backdrop-blur-md border-t"
    >
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me any question about ISUZU..."
              className="min-h-[60px] max-h-[200px] p-4 pr-12 resize-none bg-white/50 backdrop-blur-sm border-gray-200 focus-visible:ring-red-500 rounded-2xl"
              onKeyDown={onKeyDown}
            />
            <div className="absolute right-4 bottom-3">
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className={cn("h-8 w-8 rounded-full", isLoading && "animate-spin")}
                disabled={!input.trim() || isLoading}
              >
                <Send size={18} className="text-red-600" />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-center text-gray-500">Press Enter to send, Shift + Enter for new line</div>
      </form>
    </motion.div>
  )
}

