import IsuzuChat from "@/components/isuzu-chat"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-4 right-4 z-50">
        <Link 
          href="/login" 
          className="bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-md shadow transition-colors"
        >
          Admin Login
        </Link>
      </header>
      
      <main className="flex-1">
        <IsuzuChat />
      </main>
    </div>
  )
}

