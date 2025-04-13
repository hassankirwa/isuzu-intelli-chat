"use client"

interface Message {
  time: string
  content: string
  topic: string
  responseTime: string
}

interface MessagesTableProps {
  messages: Message[]
}

export function MessagesTable({ messages }: MessagesTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Recent Messages</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Time</th>
              <th className="p-4 text-left">Content</th>
              <th className="p-4 text-left">Topic</th>
              <th className="p-4 text-left">Response Time</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-4 whitespace-nowrap">{message.time}</td>
                <td className="p-4 max-w-md truncate">{message.content}</td>
                <td className="p-4">{message.topic}</td>
                <td className="p-4">{message.responseTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

