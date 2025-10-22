"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Heart, Utensils } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface UserProfileSetupProps {
  onComplete: () => void
}

export function UserProfileSetup({ onComplete }: UserProfileSetupProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    hasDiabetes: "",
    dietaryPreference: "",
    allergies: [] as string[],
    favoritesCuisines: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const { user, login } = useAuth()
  const { toast } = useToast()

  const dietaryOptions = [
    { id: "vegetarian", label: "Vegetarian" },
    { id: "vegan", label: "Vegan" },
    { id: "non-vegetarian", label: "Non-Vegetarian" },
  ]

  const cuisineOptions = [
    "Indian",
    "French",
    "Korean",
    "Mexican",
    "Chinese",
    "Italian",
    "American",
    "Thai",
    "Japanese",
    "Mediterranean",
    "Vietnamese",
    "Greek",
  ]

  const allergyOptions = ["Nuts", "Dairy", "Gluten", "Shellfish", "Eggs", "Soy", "Fish", "Sesame"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Update user context with new profile data
        const updatedUser = { ...user, ...data.user, profileComplete: true }
        login(updatedUser, token)

        toast({
          title: "Profile Updated!",
          description: "Your profile has been set up successfully.",
        })
        onComplete()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, allergy],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        allergies: prev.allergies.filter((a) => a !== allergy),
      }))
    }
  }

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        favoritesCuisines: [...prev.favoritesCuisines, cuisine],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        favoritesCuisines: prev.favoritesCuisines.filter((c) => c !== cuisine),
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Complete Your Profile
          </CardTitle>
          <CardDescription>Help us personalize your LatePlate Finder experience</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Health Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Health Information
              </h3>

              <div>
                <Label>Do you have diabetes? *</Label>
                <RadioGroup
                  value={formData.hasDiabetes}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, hasDiabetes: value }))}
                  className="flex gap-6 mt-2"
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
                <Label>Food Allergies (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {allergyOptions.map((allergy) => (
                    <div key={allergy} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergy-${allergy}`}
                        checked={formData.allergies.includes(allergy)}
                        onCheckedChange={(checked) => handleAllergyChange(allergy, checked as boolean)}
                      />
                      <Label htmlFor={`allergy-${allergy}`} className="text-sm">
                        {allergy}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dietary Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Utensils className="w-5 h-5 text-green-500" />
                Dietary Preferences
              </h3>

              <div>
                <Label>Primary Dietary Preference *</Label>
                <RadioGroup
                  value={formData.dietaryPreference}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, dietaryPreference: value }))}
                  className="grid grid-cols-2 gap-4 mt-2"
                >
                  {dietaryOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Favorite Cuisines (Select up to 5)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {cuisineOptions.map((cuisine) => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cuisine-${cuisine}`}
                        checked={formData.favoritesCuisines.includes(cuisine)}
                        onCheckedChange={(checked) => handleCuisineChange(cuisine, checked as boolean)}
                        disabled={
                          formData.favoritesCuisines.length >= 5 && !formData.favoritesCuisines.includes(cuisine)
                        }
                      />
                      <Label htmlFor={`cuisine-${cuisine}`} className="text-sm">
                        {cuisine}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">Selected: {formData.favoritesCuisines.length}/5</p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting up your profile..." : "Complete Profile Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
