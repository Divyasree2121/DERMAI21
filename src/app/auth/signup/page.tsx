"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Activity, Eye, EyeOff, ShieldAlert } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in">
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <Activity className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-2xl font-bold font-headline text-primary">Derm-AI 🏥</span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-accent">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Academic Account</CardTitle>
          <CardDescription className="text-center">
            Register to join the research project access list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                placeholder="Dr. Jane Doe" 
                required 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="researcher@university.edu" 
                required 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                required 
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
            <Button type="submit" className="w-full py-6 text-lg bg-accent hover:bg-accent/90">Create Account</Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Login
            </Link>
          </div>
          <div className="flex items-start gap-2 p-3 bg-muted rounded-md border text-[11px] text-muted-foreground leading-snug">
            <ShieldAlert className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <p>User data is collected strictly for academic verification and system access control purposes within the Derm-AI 🏥 research project framework.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
