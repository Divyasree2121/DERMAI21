
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, CheckCircle2, Loader2, Microscope, BrainCircuit } from "lucide-react"
import { preprocessAnalyzeImage, type PreprocessAnalyzeImageOutput } from "@/ai/flows/preprocess-analyze-image-flow"

export default function DashboardPage() {
  const router = useRouter()
  const [image, setImage] = React.useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [analysisStep, setAnalysisStep] = React.useState<1 | 2 | 3 | 4>(1)
  const [result, setResult] = React.useState<PreprocessAnalyzeImageOutput | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startAnalysis = async () => {
    if (!image) return
    setIsAnalyzing(true)
    setAnalysisStep(2)
    
    // Simulate steps for UI feel
    await new Promise(r => setTimeout(r, 2000))
    setAnalysisStep(3)
    
    try {
      const response = await preprocessAnalyzeImage({ imageDataUri: image })
      await new Promise(r => setTimeout(r, 2000))
      setResult(response)
      setAnalysisStep(4)
    } catch (error) {
      console.error(error)
      setIsAnalyzing(false)
      setAnalysisStep(1)
      alert("Analysis failed. Please try again.")
    }
  }

  const viewResult = () => {
    if (result) {
      localStorage.setItem("derm_ai_result", JSON.stringify(result))
      router.push("/dashboard/result")
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <header className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-3">
            <Microscope className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold font-headline text-primary">Derm-AI Analysis</h1>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Workflow Manager</p>
            </div>
          </div>
          <Button variant="ghost" asChild>
            <a href="/">Exit Project</a>
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Steps Timeline */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-4">Pipeline Progress</h3>
            {[
              { id: 1, label: "Upload Image" },
              { id: 2, label: "Preprocessing" },
              { id: 3, label: "Model Analysis" },
              { id: 4, label: "Classification" }
            ].map((s) => (
              <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${analysisStep === s.id ? 'bg-primary text-white border-primary shadow-md' : 'bg-white opacity-50'}`}>
                {analysisStep > s.id ? <CheckCircle2 className="h-5 w-5" /> : <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center text-[10px] ${analysisStep === s.id ? 'border-white' : 'border-muted-foreground'}`}>{s.id}</div>}
                <span className="text-sm font-medium">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Main Action Area */}
          <div className="md:col-span-3">
            <Card className="min-h-[400px] flex flex-col shadow-lg border-2 border-primary/10">
              <CardContent className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                {analysisStep === 1 && (
                  <>
                    {!image ? (
                      <div className="w-full h-64 border-2 border-dashed border-muted flex flex-col items-center justify-center rounded-xl bg-muted/50 transition-colors hover:bg-muted group">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload" />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                          <Upload className="h-12 w-12 text-muted-foreground mb-4 group-hover:text-primary transition-colors" />
                          <span className="font-semibold text-muted-foreground group-hover:text-primary">Click to upload dermatoscopic image</span>
                          <span className="text-xs text-muted-foreground mt-2">Base64 encoded PNG or JPG</span>
                        </label>
                      </div>
                    ) : (
                      <div className="relative w-full h-80 rounded-xl overflow-hidden border shadow-inner">
                        <Image src={image} alt="Uploaded Skin" fill className="object-contain" />
                        <button onClick={() => setImage(null)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <Button 
                      disabled={!image || isAnalyzing} 
                      onClick={startAnalysis}
                      size="lg" 
                      className="w-full max-w-xs py-6 text-lg"
                    >
                      Start AI Analysis
                    </Button>
                  </>
                )}

                {(analysisStep === 2 || analysisStep === 3) && (
                  <div className="flex flex-col items-center justify-center w-full space-y-8 py-12">
                    <div className="relative">
                      <Loader2 className="h-24 w-24 text-primary animate-spin" />
                      <BrainCircuit className="h-10 w-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="text-center space-y-3 w-full max-w-sm">
                      <h2 className="text-xl font-bold animate-pulse">
                        {analysisStep === 2 ? "Preprocessing and normalizing image..." : "Analyzing image using EfficientNetB0..."}
                      </h2>
                      <Progress value={analysisStep === 2 ? 45 : 85} className="h-2" />
                      <p className="text-sm text-muted-foreground">This may take a few moments as the deep learning model processes visual features.</p>
                    </div>
                  </div>
                )}

                {analysisStep === 4 && (
                  <div className="flex flex-col items-center justify-center w-full space-y-8 py-12 animate-fade-in">
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-16 w-16 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold">Analysis Complete</h2>
                      <p className="text-muted-foreground">Multi-class classification results are ready for clinical review.</p>
                    </div>
                    <Button onClick={viewResult} size="lg" className="w-full max-w-xs py-6 text-lg">
                      View Result
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
