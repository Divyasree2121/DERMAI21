
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, ChevronLeft, Lightbulb, Microscope, ShieldAlert, TrendingUp } from "lucide-react"
import type { PreprocessAnalyzeImageOutput } from "@/ai/flows/preprocess-analyze-image-flow"

export default function ResultPage() {
  const router = useRouter()
  const [data, setData] = React.useState<PreprocessAnalyzeImageOutput | null>(null)

  React.useEffect(() => {
    const saved = localStorage.getItem("derm_ai_result")
    if (saved) {
      setData(JSON.parse(saved))
    } else {
      router.push("/dashboard")
    }
  }, [router])

  if (!data) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        <header className="flex items-center justify-between border-b pb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Session ID</p>
            <p className="text-sm font-mono text-primary">#DAI-{Math.floor(Math.random()*10000)}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Result Card */}
          <div className="lg:col-span-1">
            <Card className="border-t-8 border-t-primary shadow-xl sticky top-6">
              <CardHeader className="text-center bg-primary/5 pb-8">
                <Microscope className="h-10 w-10 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg uppercase tracking-wider text-primary">AI Prediction Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold font-headline">{data.predictedCondition}</h2>
                  <Badge variant="secondary" className="px-4 py-1 text-base bg-primary/10 text-primary border-primary/20">
                    {data.confidenceScore.toFixed(1)}% Confidence
                  </Badge>
                  <p className="text-xs text-muted-foreground pt-4 leading-relaxed font-medium italic">
                    Likely Skin Condition Identified by AI using multi-class feature analysis.
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Classification Confidence Scale
                  </h4>
                  <div className="space-y-2">
                    {data.allPredictions.sort((a,b) => b.score - a.score).slice(0, 5).map((p) => (
                      <div key={p.condition} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{p.condition}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${p.score}%` }} />
                          </div>
                          <span className="font-mono text-xs w-8 text-right">{p.score.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 items-start">
                  <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Medical Disclaimer</p>
                    <p className="text-[11px] leading-relaxed text-amber-700 font-medium">
                      {data.disclaimer}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Solution & Problem Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-md border-l-4 border-l-destructive">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-xl">Problem Addressed</CardTitle>
                </div>
                <CardDescription>
                  Traditional dermatology faces several systemic challenges that automated AI tools aim to alleviate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {[
                    "Limited availability of expert dermatologists globally",
                    "Manual diagnosis is time-consuming and subjective",
                    "Lack of access in rural and remote areas",
                    "Dataset bias and limited skin-tone diversity in textbooks",
                    "Poor generalization in existing automated models",
                    "Lack of confidence and explainability in black-box systems"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                      <div className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-md border-l-4 border-l-accent">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  <CardTitle className="text-xl">How Derm-AI Solves the Problem</CardTitle>
                </div>
                <CardDescription>
                  Leveraging deep learning to provide data-driven insights for clinical decision support.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-semibold text-accent">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      Technical Architecture
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Utilizes the <strong>EfficientNetB0</strong> deep learning architecture, specifically tuned for medical imaging through transfer learning. 
                      This provides a balanced approach between model complexity and performance accuracy.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-semibold text-accent">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      Visual Feature Extraction
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Color variation mapping</li>
                      <li>• Texture pattern analysis</li>
                      <li>• Lesion shape quantification</li>
                      <li>• Border irregularity detection</li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Provides fast and consistent AI-assisted predictions",
                    "Supports multi-class classification across 10 conditions",
                    "Displays confidence scores for transparency",
                    "Acts as a decision-support system, not a diagnostic tool"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-accent/5 rounded-lg border border-accent/10">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">{i+1}</div>
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="text-center pt-12 pb-6 border-t">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Academic Project Demonstration • © 2024 Derm-AI Navigator</p>
        </footer>
      </div>
    </div>
  )
}
