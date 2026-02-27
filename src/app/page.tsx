"use client"

import * as React from "react"
import Link from "next/link"
import { LoadingSplash } from "@/components/ui/loading-splash"
import { Button } from "@/components/ui/button"
import { Activity, ShieldCheck, Cpu, Microscope, FlaskConical, Dna } from "lucide-react"

export default function Home() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LoadingSplash />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="max-w-4xl w-full text-center space-y-12">
        <header className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 animate-pulse-slow">
            <Activity className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-7xl font-headline font-bold tracking-tight text-primary">Derm-AI 🏥</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-assisted skin condition classification using dermatoscopic image analysis.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-accent/10 rounded-lg">
                <FlaskConical className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">Automated Image Interpretation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">AI-driven analysis reduces manual assessment variability and standardizes evaluation.</p>
            </div>
          </div>
          
          <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Microscope className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">Decision-Support Focus</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Assists clinicians and researchers without replacing expert medical judgment.</p>
            </div>
          </div>

          <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Dna className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">Broad Condition Coverage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Supports classification of inflammatory, benign, and malignant skin lesions.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="rounded-full px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="rounded-full px-12 py-6 text-lg font-semibold">
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>

        <footer className="pt-12 text-muted-foreground text-xs uppercase tracking-widest border-t">
          Final Year Academic Project • AI in Healthcare • © 2026
        </footer>
      </div>
    </div>
  )
}
