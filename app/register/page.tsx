"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle } from "lucide-react"

// In a real application, this should be an API call to register a user
const registerUser = async (username: string, password: string, confirmCode: string): Promise<boolean> => {
  // This is a simple mock implementation
  // In a real app, this would call a backend API to register the user
  
  // For demo purposes, we're requiring a special code to register as admin
  if (confirmCode !== "ISUZU-ADMIN-2024") {
    return false
  }
  
  // Store in localStorage for demo purposes only
  // In a real app, this would be handled by the backend
  const admins = JSON.parse(localStorage.getItem("admins") || "[]")
  
  // Check if username already exists
  if (admins.some((admin: any) => admin.username === username)) {
    throw new Error("Username already exists")
  }
  
  // Add new admin
  admins.push({ username, password })
  localStorage.setItem("admins", JSON.stringify(admins))
  
  return true
}

export default function RegisterPage() {
  const router = useRouter()
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [confirmCode, setConfirmCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!username || !password || !confirmPassword || !confirmCode) {
      setError("Please fill in all fields")
      return
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const success = await registerUser(username, password, confirmCode)
      
      if (success) {
        setSuccess(true)
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError("Invalid confirmation code. You must have the correct code to register as an admin.")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.")
      console.error("Registration error:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20%281%29.PNG-yKZz6kaczfTNO25McyrsOvOoduHgXn.png"
              alt="ISUZU Logo"
              className="h-12"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Admin Registration</CardTitle>
          <CardDescription className="text-center">
            Create a new admin account for ISUZU IntelliChat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="py-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Registration Successful!</h3>
              <p className="text-gray-500 mb-4">Your account has been created successfully.</p>
              <p className="text-sm">Redirecting to login page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Choose a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmCode">Admin Confirmation Code</Label>
                <Input
                  id="confirmCode"
                  placeholder="Enter the admin confirmation code"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This code is required to verify your authorization to create an admin account.
                </p>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Register"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href="/login" className="text-sm text-center w-full">
            Already have an account? <span className="underline">Login</span>
          </Link>
          <p className="text-xs text-gray-500 text-center">
            This registration is for administrative purposes only.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 