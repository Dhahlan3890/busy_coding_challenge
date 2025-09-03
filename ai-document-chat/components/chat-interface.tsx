"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  uploadedFiles: File[]
}

export function ChatInterface({ uploadedFiles }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Create FormData for the API call
      const formData = new FormData()
      uploadedFiles.forEach((file) => {
        formData.append("files", file)
      })
      formData.append("question", input)

      // Call the FastAPI endpoint
      const response = await fetch("https://busy-coding-challenge-1.onrender.com/chat-pdf/", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.answer,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          "Sorry, I couldn't process your question. Please make sure the API server is running on backend",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4 border rounded-lg mb-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Ask me anything about your uploaded documents!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3 animate-slide-up", message.type === "user" ? "justify-end" : "justify-start")}
              >
                {message.type === "bot" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <Card
                  className={cn(
                    "max-w-[80%] p-3",
                    message.type === "user" ? "bg-primary text-primary-foreground" : "bg-card",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-2 opacity-70",
                      message.type === "user" ? "text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </Card>

                {message.type === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <User className="h-4 w-4 text-accent-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 animate-pulse">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <Card className="bg-card p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your documents..."
          disabled={loading || uploadedFiles.length === 0}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={loading || !input.trim() || uploadedFiles.length === 0}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
