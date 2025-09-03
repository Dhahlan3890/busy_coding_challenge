"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Send, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EmailComposer() {
  const [recipient, setRecipient] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleSendEmail = async () => {
    if (!recipient || !subject || !body) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending.",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    try {
      const response = await fetch("http://localhost:8000/send-email/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient,
          subject,
          body,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      const data = await response.json()

      setSent(true)
      toast({
        title: "Email Sent!",
        description: `Email successfully sent to ${recipient}`,
      })

      // Reset form after 3 seconds
      setTimeout(() => {
        setRecipient("")
        setSubject("")
        setBody("")
        setSent(false)
      }, 3000)
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send email. Please check your server configuration.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Email</Label>
          <Input
            id="recipient"
            type="email"
            placeholder="recipient@example.com"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={sending || sent}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={sending || sent}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Message</Label>
          <Textarea
            id="body"
            placeholder="Write your email message here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={sending || sent}
            rows={8}
            className="resize-none"
          />
        </div>
      </div>

      {sent && (
        <Card className="p-4 bg-accent/10 border-accent animate-slide-up">
          <div className="flex items-center gap-2 text-accent">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Email sent successfully!</span>
          </div>
        </Card>
      )}

      <Button
        onClick={handleSendEmail}
        disabled={sending || sent || !recipient || !subject || !body}
        className="w-full"
        size="lg"
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : sent ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Sent!
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Email
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground text-center">
        Make sure your FastAPI server is running on localhost:8000 with proper email configuration.
      </div>
    </div>
  )
}
