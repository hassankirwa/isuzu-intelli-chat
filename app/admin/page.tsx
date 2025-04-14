"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsCard } from "@/components/admin/analytics-card"
import { MessagesTable } from "@/components/admin/messages-table"
import { BarChart, PieChart } from "@/components/ui/charts"
import { RefreshCw, Download, Trash2, Upload, AlertCircle, CheckCircle, Eye } from "lucide-react"
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

// Updated interface for UploadedFile
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
  
  // Existing file upload states
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [recentUploads, setRecentUploads] = useState<UploadedFile[]>([])

  // New states for RAG
  const [ragEnabled, setRagEnabled] = useState(true)
  const [chunkSize, setChunkSize] = useState(1000)
  const [chunkOverlap, setChunkOverlap] = useState(200)
  const [indexStats, setIndexStats] = useState({
    totalDocuments: 0,
    totalChunks: 0,
    lastUpdated: ''
  })

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

    return () => clearTimeout(timer)
  }, [isAuthenticated, router])

  // Fetch RAG stats when admin page loads
  useEffect(() => {
    const fetchRagStats = async () => {
      try {
        const token = localStorage.getItem("admin-token")
        if (!token) return
        
        const response = await fetch("/api/faiss/stats", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setIndexStats(data)
        }
      } catch (error) {
        console.error("Error fetching RAG stats:", error)
      }
    }
    
    fetchRagStats()
  }, [isAuthenticated])

  // Enhanced file upload that includes RAG processing
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
        setUploadError("No authentication token found - please login again");
        setIsUploading(false);
        return;
      }
      
      // Create form data
      const formData = new FormData()
      formData.append("file", files[0])
      formData.append("documentType", "general") // Can be a selection in the UI
      
      // Add RAG processing options
      formData.append("processForRag", ragEnabled.toString())
      formData.append("chunkSize", chunkSize.toString())
      formData.append("chunkOverlap", chunkOverlap.toString())
      
      // Simulated upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5
          return newProgress < 90 ? newProgress : prev
        })
      }, 200)
      
      // Upload file to the Python backend proxy
      const response = await fetch("api/upload-proxy", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      clearInterval(progressInterval)
      
      if (!response.ok) {
        // Try to get error details, but handle non-JSON responses gracefully
        let errorMessage = `Upload failed: ${response.statusText || response.status}`
        
        try {
          if (response.headers.get("content-type")?.includes("application/json")) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } else {
            const textError = await response.text()
            if (textError) {
              errorMessage = `${errorMessage}. Details: ${textError.substring(0, 100)}`
            }
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }
        
        throw new Error(errorMessage)
      }
      
      // Try to parse the successful response as JSON
      let result;
      try {
        setUploadProgress(100)
        result = await response.json()
      } catch (jsonError) {
        console.error("Error parsing response as JSON:", jsonError)
        throw new Error("Received invalid response from server. Please try again.")
      }
      
      // Show success with RAG info if applicable
      let successMessage = `File "${files[0].name}" uploaded successfully`
      if (result.rag && result.rag.indexed) {
        successMessage += `. Processed into ${result.rag.chunks} chunks for search.`
      }
      
      setUploadSuccess(successMessage)
      
      // Add to recent uploads
      const newUpload: UploadedFile = {
        filename: files[0].name,
        fileType: result.metadata?.fileType || files[0].type,
        fileSize: files[0].size,
        uploadedAt: new Date().toISOString(),
        chunks: result.rag?.chunks || 0
      }
      
      setRecentUploads(prev => [newUpload, ...prev.slice(0, 4)])
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      
      // Refresh RAG stats
      try {
        const statsResponse = await fetch("/api/faiss/stats", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setIndexStats(statsData)
        }
      } catch (statsError) {
        console.error("Error fetching stats:", statsError)
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Unknown error occurred")
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isAuthenticated) {
    return null // Don't render anything if not authenticated
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {isLoading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <div className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <AnalyticsCard
                    title="Total Sessions"
                    value={data.totalSessions.toString()}
                    description="All-time sessions"
                  />
                  <AnalyticsCard
                    title="Total Messages"
                    value={data.totalMessages.toString()}
                    description="All-time messages"
                  />
                  <AnalyticsCard
                    title="Avg. Response Time"
                    value={data.avgResponseTime}
                    description="Time to generate response"
                  />
                  <AnalyticsCard
                    title="Daily Active Users"
                    value={data.activeUsers.daily.toString()}
                    description={`${data.activeUsers.weekly} weekly, ${data.activeUsers.monthly} monthly`}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Message History</CardTitle>
                      <CardDescription>Total messages over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BarChart
                        data={[
                          { name: "Jan", value: 12 },
                          { name: "Feb", value: 19 },
                          { name: "Mar", value: 14 },
                          { name: "Apr", value: 21 },
                          { name: "May", value: 38 },
                          { name: "Jun", value: 42 },
                        ]}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Topics</CardTitle>
                      <CardDescription>Most discussed subjects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PieChart
                        data={data.topTopics}
                      />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Messages</CardTitle>
                    <CardDescription>Last few interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MessagesTable messages={data.messages} />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Document Search Index</CardTitle>
                  <CardDescription>
                    Upload and index documents for semantic search
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-md font-medium mb-2">Upload Documents</h3>
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="rag-enabled"
                            checked={ragEnabled}
                            onChange={(e) => setRagEnabled(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <label htmlFor="rag-enabled">
                            Process for semantic search
                          </label>
                        </div>
                        
                        {ragEnabled && (
                          <div className="space-y-2 pl-6 border-l-2 border-gray-200 mt-2">
                            <div>
                              <label className="block text-sm mb-1">
                                Chunk Size (characters)
                              </label>
                              <input
                                type="number"
                                value={chunkSize}
                                onChange={(e) => setChunkSize(parseInt(e.target.value) || 1000)}
                                className="w-full p-2 border rounded"
                                min="100"
                                max="10000"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm mb-1">
                                Chunk Overlap (characters)
                              </label>
                              <input
                                type="number"
                                value={chunkOverlap}
                                onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 200)}
                                className="w-full p-2 border rounded"
                                min="0"
                                max={chunkSize / 2}
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-4">
                          <div className="relative">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              className="w-full p-2 border rounded"
                              accept=".pdf,.csv,.xlsx,.xls,.json,.txt"
                            />
                            
                            {isUploading && (
                              <div className="mt-2">
                                <Progress value={uploadProgress} className="h-2" />
                                <p className="text-xs text-center mt-1">Uploading... {uploadProgress}%</p>
                              </div>
                            )}
                            
                            {uploadSuccess && (
                              <div className="flex items-center mt-2 text-green-600 text-sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {uploadSuccess}
                              </div>
                            )}
                            
                            {uploadError && (
                              <div className="flex items-center mt-2 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {uploadError}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-2">Search Index Stats</h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Documents:</span>
                          <span className="font-medium">{indexStats.totalDocuments}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm">Total Chunks:</span>
                          <span className="font-medium">{indexStats.totalChunks}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm">Last Updated:</span>
                          <span className="font-medium">
                            {indexStats.lastUpdated 
                              ? new Date(indexStats.lastUpdated).toLocaleString() 
                              : 'Never'}
                          </span>
                        </div>
                        
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem("admin-token")
                                const response = await fetch("/api/faiss/reindex", {
                                  method: "POST",
                                  headers: {
                                    Authorization: `Bearer ${token}`
                                  }
                                })
                                
                                if (response.ok) {
                                  const result = await response.json()
                                  setUploadSuccess(`Reindexed ${result.indexed} documents successfully`)
                                  
                                  // Refresh stats
                                  const statsResponse = await fetch("/api/faiss/stats", {
                                    headers: {
                                      Authorization: `Bearer ${token}`
                                    }
                                  })
                                  
                                  if (statsResponse.ok) {
                                    const statsData = await statsResponse.json()
                                    setIndexStats(statsData)
                                  }
                                } else {
                                  const errorData = await response.json()
                                  setUploadError(errorData.error || "Failed to reindex documents")
                                }
                              } catch (error) {
                                setUploadError("Failed to reindex documents")
                                console.error(error)
                              }
                            }}
                          >
                            Reindex All Documents
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Uploads</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    {recentUploads.length === 0 ? (
                      <p className="text-sm text-gray-500">No recent uploads</p>
                    ) : (
                      recentUploads.map((file, i) => (
                        <div key={i} className="flex justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">{file.filename}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(file.uploadedAt).toLocaleString()} · {formatFileSize(file.fileSize)}
                              {file.chunks ? ` · ${file.chunks} chunks` : ''}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                // View document details
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                // Delete the document
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure the IntelliChat system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Settings options will be added here in a future update.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

