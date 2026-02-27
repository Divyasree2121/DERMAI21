"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { AlertCircle, ChevronLeft, Lightbulb, Microscope, ShieldAlert, TrendingUp, FileDown, Loader2, Save, Lock, Info, LogOut } from "lucide-react"
import type { PreprocessAnalyzeImageOutput } from "@/ai/flows/preprocess-analyze-image-flow"
import { encryptData } from "@/lib/crypto"
import { useToast } from "@/hooks/use-toast"

export default function ResultPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = React.useState<PreprocessAnalyzeImageOutput | null>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [isDownloading, setIsDownloading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [sessionId, setSessionId] = React.useState("")
  const [analysisDate, setAnalysisDate] = React.useState("")
  const [savePassword, setSavePassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isSaveDialogOpen, setIsSaveDialogOpen] = React.useState(false)
  const reportRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const savedResult = localStorage.getItem("derm_ai_result")
    const savedImage = localStorage.getItem("derm_ai_image")
    
    if (savedResult) {
      setData(JSON.parse(savedResult))
    } else {
      router.push("/dashboard")
    }

    if (savedImage) {
      setImage(savedImage)
    }

    setSessionId(`#DAI-${Math.floor(Math.random() * 100000)}`)
    setAnalysisDate(new Date().toLocaleString())
  }, [router])

  const handleDownloadReport = async () => {
    if (!reportRef.current) return
    setIsDownloading(true)
    
    try {
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      })
      
      const imgData = canvas.toDataURL("image/jpeg", 0.95)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Derm-AI-Report-${sessionId}.pdf`)
      
    } catch (error) {
      console.error("PDF Generation failed:", error)
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not generate PDF report."
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSaveToVault = async () => {
    if (!data || !image) return
    if (savePassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords mismatch",
        description: "Please ensure both password fields are identical."
      })
      return
    }
    if (savePassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters long."
      })
      return
    }

    setIsSaving(true)
    try {
      const payload = JSON.stringify({
        data,
        image,
        sessionId,
        analysisDate
      })
      
      const encrypted = await encryptData(payload, savePassword)
      
      const existingVault = JSON.parse(localStorage.getItem("derm_ai_vault") || "[]")
      const newEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        condition: data.predictedCondition,
        encryptedData: encrypted,
        sessionId
      }
      
      localStorage.setItem("derm_ai_vault", JSON.stringify([newEntry, ...existingVault]))
      
      toast({
        title: "Report Saved! 🔒",
        description: "The report is now securely stored in your Local Vault."
      })
      setIsSaveDialogOpen(false)
      setSavePassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Save failed:", error)
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "An error occurred while encrypting the data."
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        <header className="flex flex-col sm:flex-row items-center justify-between border-b pb-6 gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="gap-2 self-start">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5">
                  <Save className="h-4 w-4" />
                  Save to Local Vault
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Secure Report Vault
                  </DialogTitle>
                  <DialogDescription>
                    Set a password to encrypt and save this report locally in your browser.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="pass">Set Password</Label>
                    <Input 
                      id="pass" 
                      type="password" 
                      placeholder="Min 6 characters" 
                      value={savePassword}
                      onChange={(e) => setSavePassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm Password</Label>
                    <Input 
                      id="confirm" 
                      type="password" 
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>This password will be required to open the report later. We do not store this password; if lost, the report cannot be recovered.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveToVault} disabled={isSaving} className="w-full">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Encrypt & Save Report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleDownloadReport} 
              disabled={isDownloading}
              variant="default" 
              className="gap-2 bg-accent hover:bg-accent/90 shadow-md"
            >
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              Download (PDF)
            </Button>

            <Button variant="ghost" onClick={() => router.push("/")} className="gap-2 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Result Card */}
          <div className="lg:col-span-1">
            <Card className="border-t-8 border-t-primary shadow-xl sticky top-6">
              <CardHeader className="text-center bg-primary/5 pb-8">
                <div className="relative inline-block mx-auto mb-4">
                  <Microscope className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-lg uppercase tracking-wider text-primary">AI Prediction Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold font-headline">{data.predictedCondition}</h2>
                  <Badge variant="secondary" className="px-4 py-1 text-base bg-primary/10 text-primary border-primary/20">
                    {data.confidenceScore.toFixed(1)}% Confidence
                  </Badge>
                  {image && (
                    <div className="mt-6 relative w-full aspect-square rounded-lg overflow-hidden border-2 border-primary/10 shadow-inner">
                      <Image src={image} alt="Dermatoscopic view" fill className="object-cover" />
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    AI Reasoning & Explanation
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {data.explanation || "The AI model identified specific texture and color irregularities consistent with the predicted pathology."}
                  </p>
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

          {/* Detailed Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-md border-l-4 border-l-destructive">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-xl">Problem Addressed</CardTitle>
                </div>
                <CardDescription>
                  Traditional dermatology faces systemic challenges that Derm-AI 🏥 aims to solve.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {[
                    "Limited availability of expert dermatologists globally",
                    "Manual diagnosis is time-consuming and subjective",
                    "Lack of access in rural and remote areas",
                    "Dataset bias in traditional medical training",
                    "Need for standardized multi-class classification",
                    "Requirement for rapid clinical decision support"
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
                  <CardTitle className="text-xl">Solution Approach</CardTitle>
                </div>
                <CardDescription>
                  Leveraging state-of-the-art deep learning for medical feature extraction.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-semibold text-accent">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      EfficientNetB0 Architecture
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      A scaled convolutional neural network that provides optimal performance for medical image classification by balancing width, depth, and resolution.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-semibold text-accent">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      Multi-class Analysis
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Color variation gradient mapping</li>
                      <li>• Texture feature vectoring</li>
                      <li>• Morphological shape analysis</li>
                      <li>• Peripheral border detection</li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Provides standardized data-driven insights",
                    "Reduces clinical screening bottlenecks",
                    "Empowers researchers with objective scoring",
                    "Continuous learning from dermatoscopic datasets"
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

        {/* Hidden Report Template for PDF Generation */}
        <div className="fixed -left-[9999px] top-0 overflow-hidden" aria-hidden="true">
          <div ref={reportRef} className="p-12 bg-white text-black w-[210mm]" style={{ minHeight: "297mm", color: 'black' }}>
            <div className="border-b-4 border-primary pb-8 mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2">Derm-AI 🏥 Report</h1>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">AI-Assisted Clinical Decision Support</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400">SESSION ID</p>
                <p className="text-lg font-mono text-primary font-bold">{sessionId}</p>
                <p className="text-xs text-gray-500 mt-1">{analysisDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="space-y-8">
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-4">Analyzed Specimen</h3>
                  {image && (
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border shadow-md bg-gray-50">
                      <img src={image} alt="Report specimen" className="w-full h-full object-cover" />
                    </div>
                  )}
                </section>
              </div>

              <div className="space-y-8">
                <section className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                  <h3 className="text-xs font-bold text-primary uppercase mb-4">AI Prediction Result</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{data.predictedCondition}</p>
                      <p className="text-primary font-bold text-xl">{data.confidenceScore.toFixed(1)}% Confidence</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Clinical Explanation</p>
                      <p className="text-sm text-gray-700 leading-relaxed italic">
                        {data.explanation || "Primary prediction based on multi-class visual feature extraction using EfficientNetB0."}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-dashed border-gray-300">
              <div className="bg-gray-100 p-6 rounded-xl border border-gray-200">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Mandatory Medical Disclaimer</p>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                  {data.disclaimer}
                </p>
              </div>
              <p className="text-center text-[9px] text-gray-400 uppercase tracking-widest mt-8 italic">
                This document is a research-only demonstration for Derm-AI 🏥 Navigator project.
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center pt-12 pb-6 border-t">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Derm-AI • © 2026</p>
        </footer>
      </div>
    </div>
  )
}