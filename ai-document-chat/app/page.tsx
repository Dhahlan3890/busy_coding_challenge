"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { ChatInterface } from "@/components/chat-interface"
import { EmailComposer } from "@/components/email-composer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, MessageSquare, Mail, Sparkles } from "lucide-react"

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [vectorStore, setVectorStore] = useState<boolean>(false)

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files)
    setVectorStore(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Resume Analyzer and Email Sender
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your resume, ask intelligent questions, and send professional emails with AI-powered assistance
          </p>
        </div>

        {/* Main Interface */}
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload Documents
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2" disabled={!vectorStore}>
                <MessageSquare className="h-4 w-4" />
                Ask Questions
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Send Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="animate-fade-in">
              <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Document Upload
                  </CardTitle>
                  <CardDescription>
                    Upload your resume to analyze and ask questions about its content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onFilesUploaded={handleFilesUploaded} />
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 animate-slide-up">
                      <h3 className="font-semibold mb-3 text-primary">Uploaded Files:</h3>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                            <FileText className="h-4 w-4 text-accent" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Document Chat
                  </CardTitle>
                  <CardDescription>
                    Ask questions about your uploaded resume and get AI-powered answers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChatInterface uploadedFiles={uploadedFiles} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Email Composer
                  </CardTitle>
                  <CardDescription>Send professional emails with AI assistance</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailComposer />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
