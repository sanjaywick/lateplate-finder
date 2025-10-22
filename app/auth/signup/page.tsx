"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Phone, Heart, Utensils, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Step 1: Basic account information
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Step 2: Profile information
  const [profileInfo, setProfileInfo] = useState({
    phone: "",
    hasDiabetes: "",
    foodAllergies: [] as string[],
    dietaryPreference: "",
    favoriteCuisines: [] as string[],
  })

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Next button clicked")

    // Validate basic info
    if (!basicInfo.name || !basicInfo.email || !basicInfo.password) {
      setError("Please fill in all required fields")
      return
    }

    if (basicInfo.password !== basicInfo.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (basicInfo.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setError("")
    setStep(2)
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Create Account button clicked")

    if (!profileInfo.phone || !profileInfo.hasDiabetes || !profileInfo.dietaryPreference) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const userData = {
        ...basicInfo,
        ...profileInfo,
      }

      console.log("Submitting user data:", userData)

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      console.log("Signup response:", data)

      if (response.ok) {
        console.log("Account created successfully")
        router.push("/auth/login?message=Account created successfully")
      } else {
        setError(data.message || "Failed to create account")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Back button clicked")
    setStep(1)
    setError("")
  }

  const handleFoodAllergyChange = (allergy: string, checked: boolean) => {
    if (checked) {
      setProfileInfo({
        ...profileInfo,
        foodAllergies: [...profileInfo.foodAllergies, allergy],
      })
    } else {
      setProfileInfo({
        ...profileInfo,
        foodAllergies: profileInfo.foodAllergies.filter((a) => a !== allergy),
      })
    }
  }

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    if (checked && profileInfo.favoriteCuisines.length < 5) {
      setProfileInfo({
        ...profileInfo,
        favoriteCuisines: [...profileInfo.favoriteCuisines, cuisine],
      })
    } else if (!checked) {
      setProfileInfo({
        ...profileInfo,
        favoriteCuisines: profileInfo.favoriteCuisines.filter((c) => c !== cuisine),
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Step {step} of 2: {step === 1 ? "Account Information" : "Profile Setup"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-700 mb-4">
                <User className="w-5 h-5" />
                <h3 className="font-semibold">Account Information</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={basicInfo.email}
                  onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={basicInfo.password}
                  onChange={(e) => setBasicInfo({ ...basicInfo, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={basicInfo.confirmPassword}
                  onChange={(e) => setBasicInfo({ ...basicInfo, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button onClick={handleNext} className="w-full" style={{ zIndex: 9999, pointerEvents: "auto" }}>
                Next Step
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <div className="flex items-center gap-2 text-blue-700 mb-4">
                  <Phone className="w-5 h-5" />
                  <h3 className="font-semibold">Contact Information</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={profileInfo.phone}
                    onChange={(e) => setProfileInfo({ ...profileInfo, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Health Information */}
              <div>
                <div className="flex items-center gap-2 text-red-600 mb-4">
                  <Heart className="w-5 h-5" />
                  <h3 className="font-semibold">Health Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Do you have diabetes? *</Label>
                    <RadioGroup
                      value={profileInfo.hasDiabetes}
                      onValueChange={(value) => setProfileInfo({ ...profileInfo, hasDiabetes: value })}
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="diabetes-yes" />
                        <Label htmlFor="diabetes-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="diabetes-no" />
                        <Label htmlFor="diabetes-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Food Allergies (Select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Nuts", "Dairy", "Gluten", "Shellfish", "Eggs", "Soy", "Fish", "Sesame"].map((allergy) => (
                        <div key={allergy} className="flex items-center space-x-2">
                          <Checkbox
                            id={`allergy-${allergy.toLowerCase()}`}
                            checked={profileInfo.foodAllergies.includes(allergy)}
                            onCheckedChange={(checked) => handleFoodAllergyChange(allergy, checked as boolean)}
                          />
                          <Label htmlFor={`allergy-${allergy.toLowerCase()}`} className="text-sm">
                            {allergy}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <Utensils className="w-5 h-5" />
                  <h3 className="font-semibold">Dietary Preferences</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Primary Dietary Preference *</Label>
                    <RadioGroup
                      value={profileInfo.dietaryPreference}
                      onValueChange={(value) => setProfileInfo({ ...profileInfo, dietaryPreference: value })}
                      className="grid grid-cols-2 gap-2 mt-2"
                    >
                      {["Vegetarian", "Vegan", "Non-Vegetarian", "Sugar Free Diet"].map((diet) => (
                        <div key={diet} className="flex items-center space-x-2">
                          <RadioGroupItem value={diet} id={`diet-${diet.toLowerCase()}`} />
                          <Label htmlFor={`diet-${diet.toLowerCase()}`} className="text-sm">
                            {diet}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Favorite Cuisines (Select up to 5)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Indian",
                        "French",
                        "Italian",
                        "Korean",
                        "American",
                        "Mexican",
                        "Chinese",
                        "Thai",
                        "Japanese",
                        "Mediterranean",
                        "Vietnamese",
                        "Greek",
                      ].map((cuisine) => (
                        <div key={cuisine} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cuisine-${cuisine.toLowerCase()}`}
                            checked={profileInfo.favoriteCuisines.includes(cuisine)}
                            onCheckedChange={(checked) => handleCuisineChange(cuisine, checked as boolean)}
                            disabled={
                              !profileInfo.favoriteCuisines.includes(cuisine) &&
                              profileInfo.favoriteCuisines.length >= 5
                            }
                          />
                          <Label htmlFor={`cuisine-${cuisine.toLowerCase()}`} className="text-sm">
                            {cuisine}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Selected: {profileInfo.favoriteCuisines.length}/5</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 bg-transparent"
                  style={{ zIndex: 9999, pointerEvents: "auto" }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleCreateAccount}
                  disabled={loading}
                  className="flex-1"
                  style={{ zIndex: 9999, pointerEvents: "auto" }}
                >
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
