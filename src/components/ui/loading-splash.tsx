"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"

const loadingTexts = [
  "Initializing AI System...",
  "Loading EfficientNetB0 Model...",
  "Preparing Image Analysis Pipeline..."
]

export function LoadingSplash() {
  const [textIndex, setTextIndex] = React.useState(0)
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length)
    }, 1500)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        return prev + 1
      })
    }, 30)

    return () => {
      clearInterval(textInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6">
      <div className="mb-12 text-center animate-pulse-slow">
        <h1 className="text-6xl font-headline font-bold tracking-tight text-primary">Derm-AI</h1>
        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">Artificial Intelligence Healthcare</p>
      </div>
      
      <div className="w-full max-w-xs space-y-4">
        <Progress value={progress} className="h-1" />
        <p className="text-center text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500">
          {loadingTexts[textIndex]}
        </p>
      </div>
    </div>
  )
}
