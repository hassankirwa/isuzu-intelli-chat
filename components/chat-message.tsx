"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { type Message } from "@/utils/useCustomChat"

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3 mb-8", isUser && "flex-row-reverse")}
    >
      <Avatar className="w-8 h-8">
        {isUser ? (
          <AvatarFallback className="bg-blue-600 text-white">U</AvatarFallback>
        ) : (
          <AvatarFallback className="bg-red-600 text-white">I</AvatarFallback>
        )}
      </Avatar>

      <div className={cn("flex flex-col gap-2 max-w-[80%] relative group", isUser && "items-end")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl relative break-words",
            "before:absolute before:w-4 before:h-4 before:rotate-45",
            isUser
              ? ["bg-blue-600 text-white", "before:bg-blue-600", "before:right-[-8px] before:top-4", "rounded-tr-none"]
              : [
                  "bg-white/90 backdrop-blur-sm text-gray-800",
                  "before:bg-white/90",
                  "before:left-[-8px] before:top-4",
                  "rounded-tl-none",
                  "shadow-sm",
                ],
          )}
        >
          <div className="relative z-10">
            {isUser ? (
              message.content
            ) : (
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-2" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                  a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
        <span className={cn("text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity", "px-2")}>
          {new Date().toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  )
}

