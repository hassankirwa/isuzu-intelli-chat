import { DocumentSearchTest } from "@/components/document-search-test";

export default function TestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Document Search Test Page</h1>
      <p className="text-center mb-8 text-gray-600">
        This page lets you test the document search functionality by querying the uploaded JSON documents.
      </p>
      <DocumentSearchTest />
    </div>
  );
} 