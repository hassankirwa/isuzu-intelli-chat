"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsCard } from "@/components/admin/analytics-card"
import { MessagesTable } from "@/components/admin/messages-table"
import { BarChart, PieChart } from "@/components/ui/charts"
import { RefreshCw, Download, Trash2, Upload, Database, AlertCircle, CheckCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Mock data for the admin dashboard
const mockData = {
  totalSessions: 5,
  totalMessages: 14,
  avgResponseTime: "1.01s",
  activeUsers: {
    daily: 5,
    weekly: 5,
    monthly: 5,
  },
  topTopics: [
    { name: "Dealers", value: 29 },
    { name: "Financing", value: 14 },
    { name: "Service", value: 14 },
    { name: "Contact", value: 14 },
    { name: "MU-X", value: 14 },
    { name: "Other", value: 14 },
  ],
  messages: [
    {
      time: "12/03/2025, 19:05:01",
      content: "ISUZU Kenya recommends servicing your vehicle every 5,000 km or 3 months, whichever comes first.",
      topic: "Service",
      responseTime: "1.00s",
    },
    {
      time: "12/03/2025, 19:05:00",
      content: "Tell me about service and maintenance",
      topic: "Service",
      responseTime: "N/A",
    },
    {
      time: "12/03/2025, 19:04:55",
      content: "What are the maintenance requirements for ISUZU trucks?",
      topic: "Service",
      responseTime: "1.02s",
    },
    {
      time: "12/03/2025, 19:04:50",
      content:
        "Hello! Welcome to ISUZU Kenya's IntelliChat. I can provide information about our vehicles, services, and more.",
      topic: "D-MAX",
      responseTime: "1.00s",
    },
  ],
  topicsData: [
    { topic: "Dealers", count: 12, percentage: "29%" },
    { topic: "Service", count: 8, percentage: "14%" },
    { topic: "D-MAX", count: 6, percentage: "14%" },
    { topic: "MU-X", count: 6, percentage: "14%" },
    { topic: "Financing", count: 6, percentage: "14%" },
    { topic: "Contact", count: 6, percentage: "14%" },
    { topic: "Other", count: 6, percentage: "14%" },
  ],
  sessions: [
    { id: 1, user: "User123", startTime: "12/03/2025, 19:04:30", duration: "5m 32s", messages: 8 },
    { id: 2, user: "User456", startTime: "12/03/2025, 18:30:15", duration: "3m 45s", messages: 6 },
    { id: 3, user: "User789", startTime: "12/03/2025, 17:15:22", duration: "8m 10s", messages: 12 },
    { id: 4, user: "User234", startTime: "12/03/2025, 16:05:18", duration: "2m 20s", messages: 4 },
    { id: 5, user: "User567", startTime: "12/03/2025, 15:45:30", duration: "4m 55s", messages: 7 },
  ],
}

// New interfaces for ChromaDB statistics
interface ChromaStats {
  name: string
  count: number
  success: boolean
}

interface UploadedFile {
  filename: string
  fileType: string
  fileSize: number
  uploadedAt: string
  chunks?: number
}

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState(mockData)
  
  // New states for ChromaDB and file uploads
  const [chromaStats, setChromaStats] = useState<ChromaStats | null>(null)
  const [isLoadingChroma, setIsLoadingChroma] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [recentUploads, setRecentUploads] = useState<UploadedFile[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    // Simulate data loading
    const timer = setTimeout(() => {
      setData(mockData)
      setIsLoading(false)
    }, 500)

    // Load ChromaDB stats
    fetchChromaStats()

    return () => clearTimeout(timer)
  }, [isAuthenticated, router])

  // Fetch ChromaDB statistics
  const fetchChromaStats = async () => {
    try {
      setIsLoadingChroma(true)
      
      // Get token from localStorage
      const token = localStorage.getItem("admin-token")
      if (!token) {
        throw new Error("No authentication token found")
      }
      
      const response = await fetch("/api/chroma/stats", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`)
      }
      
      const stats = await response.json()
      setChromaStats(stats)
    } catch (error) {
      console.error("Error fetching ChromaDB stats:", error)
      setChromaStats(null)
    } finally {
      setIsLoadingChroma(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    // Reset states
    setUploadSuccess(null)
    setUploadError(null)
    setUploadProgress(0)
    setIsUploading(true)
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem("admin-token")
      if (!token) {
        throw new Error("No authentication token found")
      }
      
      // Create form data
      const formData = new FormData()
      formData.append("file", files[0])
      
      // Simulated upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5
          return newProgress < 90 ? newProgress : prev
        })
      }, 200)
      
      // Upload file
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })
      
      clearInterval(progressInterval)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }
      
      setUploadProgress(100)
      
      const result = await response.json()
      setUploadSuccess(`File "${files[0].name}" uploaded successfully and added to database`)
      
      // Add to recent uploads
      const newUpload: UploadedFile = {
        filename: files[0].name,
        fileType: result.metadata.fileType,
        fileSize: files[0].size,
        uploadedAt: new Date().toISOString(),
        chunks: result.count
      }
      
      setRecentUploads(prev => [newUpload, ...prev.slice(0, 4)])
      
      // Refresh ChromaDB stats
      fetchChromaStats()
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Unknown error occurred")
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  if (!isAuthenticated) {
    return null // Don't render anything if not authenticated
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20%281%29.PNG-yKZz6kaczfTNO25McyrsOvOoduHgXn.png"
              alt="ISUZU Logo"
              className="h-8"
            />
            <h1 className="text-2xl font-bold">ISUZU Kenya Chatbot Analytics</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setIsLoading(true)
              fetchChromaStats()
              
              // Simulate loading delay
              setTimeout(() => {
                setData(mockData)
                setIsLoading(false)
              }, 500)
            }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout()
                router.push("/")
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {isLoading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <AnalyticsCard
                    title="Total Sessions"
                    value={data.totalSessions}
                    description="Number of chat sessions"
                  />
                  <AnalyticsCard
                    title="Total Messages"
                    value={data.totalMessages}
                    description="Number of messages exchanged"
                  />
                  <AnalyticsCard
                    title="Avg. Response Time"
                    value={data.avgResponseTime}
                    description="Average time to respond"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-4 text-lg font-medium">Active Users</h3>
                    <div className="h-[250px]">
                      <BarChart
                        data={[
                          { name: "Daily", value: data.activeUsers.daily },
                          { name: "Weekly", value: data.activeUsers.weekly },
                          { name: "Monthly", value: data.activeUsers.monthly },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border bg-card p-6">
                    <h3 className="mb-4 text-lg font-medium">Top Topics</h3>
                    <div className="h-[250px]">
                      <PieChart data={data.topTopics} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="topics">
            {isLoading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <div className="rounded-lg border bg-card">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium">Most Discussed Topics</h3>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-3 p-4 font-medium">
                    <div>Topic</div>
                    <div>Count</div>
                    <div>Percentage</div>
                  </div>
                  {data.topicsData.map((item, index) => (
                    <div key={index} className="grid grid-cols-3 p-4">
                      <div>{item.topic}</div>
                      <div>{item.count}</div>
                      <div>{item.percentage}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            {isLoading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <div className="rounded-lg border bg-card">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium">Chat Sessions</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left">ID</th>
                        <th className="p-4 text-left">User</th>
                        <th className="p-4 text-left">Start Time</th>
                        <th className="p-4 text-left">Duration</th>
                        <th className="p-4 text-left">Messages</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sessions.map((session) => (
                        <tr key={session.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">{session.id}</td>
                          <td className="p-4">{session.user}</td>
                          <td className="p-4">{session.startTime}</td>
                          <td className="p-4">{session.duration}</td>
                          <td className="p-4">{session.messages}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages">
            {isLoading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <MessagesTable messages={data.messages} />
            )}
          </TabsContent>
          
          {/* New Documents tab */}
          <TabsContent value="documents" className="space-y-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Documents</CardTitle>
                    <CardDescription>
                      Upload files to be indexed in the vector database. Supported formats: TXT, CSV, JSON, Markdown.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Input 
                        ref={fileInputRef}
                        type="file" 
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        accept=".txt,.csv,.json,.md"
                      />
                    </div>
                    
                    {isUploading && (
                      <div className="mb-4">
                        <p className="text-sm mb-2">Uploading and processing file...</p>
                        <Progress value={uploadProgress} />
                      </div>
                    )}
                    
                    {uploadSuccess && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded mb-4">
                        <CheckCircle className="h-4 w-4" />
                        <p className="text-sm">{uploadSuccess}</p>
                      </div>
                    )}
                    
                    {uploadError && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">Error: {uploadError}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-gray-500">
                      Documents will be chunked and embedded in the vector database to provide better answers to user queries.
                    </p>
                  </CardFooter>
                </Card>
                
                {recentUploads.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Recent Uploads</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="p-2 text-left text-xs font-medium">Filename</th>
                              <th className="p-2 text-left text-xs font-medium">Type</th>
                              <th className="p-2 text-left text-xs font-medium">Size</th>
                              <th className="p-2 text-left text-xs font-medium">Chunks</th>
                              <th className="p-2 text-left text-xs font-medium">Uploaded</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentUploads.map((file, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-2 text-xs">{file.filename}</td>
                                <td className="p-2 text-xs">{file.fileType}</td>
                                <td className="p-2 text-xs">{Math.round(file.fileSize / 1024)} KB</td>
                                <td className="p-2 text-xs">{file.chunks || '-'}</td>
                                <td className="p-2 text-xs">
                                  {new Date(file.uploadedAt).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Vector Database</CardTitle>
                    <CardDescription>
                      ChromaDB statistics and information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingChroma ? (
                      <div className="text-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-500">Loading database statistics...</p>
                      </div>
                    ) : chromaStats ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Database className="h-8 w-8 text-primary" />
                          <div>
                            <h3 className="font-medium">{chromaStats.name}</h3>
                            <p className="text-sm text-gray-500">Collection Name</p>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">Document Chunks</h4>
                            <span className="text-2xl font-bold">{chromaStats.count}</span>
                          </div>
                          <Progress value={(chromaStats.count / 1000) * 100} max={100} />
                          <p className="text-xs text-gray-500 mt-1">
                            {chromaStats.count} chunks of text are indexed in the database
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={fetchChromaStats}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh Stats
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          Could not load database statistics.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={fetchChromaStats}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Try Again
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

