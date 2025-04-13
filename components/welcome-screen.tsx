"use client"

import { motion } from "framer-motion"
import { Truck, MapPin, FileText, Settings } from "lucide-react"

const suggestions = [
  {
    icon: Truck,
    text: "What are the specifications of the latest ISUZU D-MAX?",
  },
  {
    icon: MapPin,
    text: "Where can I find the nearest ISUZU dealer?",
  },
  {
    icon: Settings,
    text: "What maintenance is required for my ISUZU vehicle?",
  },
  {
    icon: FileText,
    text: "Tell me about ISUZU's warranty coverage",
  },
]

export function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg max-w-2xl w-full"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome to ISUZU IntelliChat</h2>
        <p className="text-gray-600 mb-2">
          I'm your AI assistant for all things ISUZU. I can provide detailed information about:
        </p>
        <ul className="text-gray-600 mb-6 text-left list-disc pl-6">
          <li>ISUZU vehicle specifications and features</li>
          <li>Maintenance schedules and service information</li>
          <li>Dealer locations and warranty details</li>
          <li>General automotive knowledge and advice</li>
        </ul>
        <p className="text-gray-600 mb-8 italic text-sm">
          My knowledge is based on ISUZU's official website and product brochures.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: index * 0.1 },
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestionClick(suggestion.text)}
              className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left group"
            >
              <div className="p-2 rounded-lg bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
                <suggestion.icon size={20} />
              </div>
              <span className="text-sm text-gray-700">{suggestion.text}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

