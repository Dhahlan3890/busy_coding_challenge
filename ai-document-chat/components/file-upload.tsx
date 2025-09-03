"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void
}

export function FileUpload({ onFilesUploaded }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploaded, setUploaded] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter((file) => file.type === "application/pdf")
    setFiles((prev) => [...prev, ...pdfFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          setUploaded(true)
          onFilesUploaded(files)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-primary bg-primary/5 scale-105"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          uploaded && "border-accent bg-accent/5",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {uploaded ? (
            <CheckCircle className="h-12 w-12 text-accent animate-bounce" />
          ) : (
            <Upload
              className={cn(
                "h-12 w-12 transition-colors",
                isDragActive ? "text-primary animate-pulse" : "text-muted-foreground",
              )}
            />
          )}
          <div>
            <p className="text-lg font-semibold">
              {uploaded
                ? "Files uploaded successfully!"
                : isDragActive
                  ? "Drop your PDF files here"
                  : "Drag & drop PDF files here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {uploaded ? "Ready to ask questions!" : "or click to browse files"}
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3 animate-slide-up">
          <h3 className="font-semibold text-primary">Selected Files:</h3>
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
              <FileText className="h-5 w-5 text-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {!uploaded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex justify-between text-sm">
            <span>Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !uploaded && (
        <Button onClick={handleUpload} disabled={uploading} className="w-full animate-slide-up" size="lg">
          {uploading ? "Processing..." : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}
        </Button>
      )}
    </div>
  )
}
