'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileSearch, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function DocumentSearchTest() {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      // Use the new search API endpoint
      const response = await fetch(`/api/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Search failed: ${response.status} ${response.statusText}. ${errorData}`);
      }

      const data = await response.json();
      setSearchResult(data.response || "No information found");
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Document Search Test</CardTitle>
        <CardDescription>
          Search uploaded documents for information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="What would you like to know?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isLoading || !query}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileSearch className="h-4 w-4 mr-2" />
            )}
            Search
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {searchResult && (
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Search Results</h3>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {searchResult}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 