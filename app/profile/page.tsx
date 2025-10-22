"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, ChefHat, Star, Clock, Settings, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface UserActivity {
  _id: string
  type: "restaurant" | "recipe" | "grocery" | "feedback"
  action: string
  details: string
  timestamp: string
}

interface UserFeedback {
  _id: string
  rating: number
  feedback: string
  category: string
  timestamp: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  role: string
  hasDiabetes: boolean
  dietaryPreference: string
  allergies: string[]
  favoritesCuisines: string[]
  profileComplete: boolean
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editProfile, setEditProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    dietaryPreferences: [] as string[],
    favoritesCuisines: [] as string[],
  })
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchUserData()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setEditProfile({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          location: "",
          dietaryPreferences: data.user.allergies || [],
          favoritesCuisines: data.user.favoritesCuisines || [],
        })
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    }
  }

  const fetchUserData = async () => {
    try {
      setLoading(true)

      // Fetch user activities
      const activitiesResponse = await fetch("/api/user/activities", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        setUserActivities(activitiesData.activities || [])
      }

      // Fetch user's own feedback
      const feedbackResponse = await fetch(`/api/user/feedback`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json()
        setUserFeedback(feedbackData.feedback || [])
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: editProfile.name,
          email: editProfile.email,
          phone: editProfile.phone,
          allergies: editProfile.dietaryPreferences,
          favoritesCuisines: editProfile.favoritesCuisines,
        }),
      })

      if (response.ok) {
        toast({ title: "Profile updated!", description: "Your changes have been saved." })
        await fetchUserProfile() // Refresh profile data
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    } finally {
      setUpdating(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "restaurant":
        return <MapPin className="w-4 h-4" />
      case "recipe":
        return <ChefHat className="w-4 h-4" />
      case "grocery":
        return <MapPin className="w-4 h-4" />
      case "feedback":
        return <MessageCircle className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "restaurant":
        return "bg-blue-500"
      case "recipe":
        return "bg-green-500"
      case "grocery":
        return "bg-purple-500"
      case "feedback":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-900">
            LatePlate Finder
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-700 bg-transparent">
                Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and view your activity</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="history">Activity History</TabsTrigger>
            <TabsTrigger value="feedback">My Feedback</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Update your personal details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-700">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={editProfile.name}
                        onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                        className="text-gray-900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={editProfile.email}
                        onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                        className="text-gray-900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={editProfile.phone}
                        onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-700">Current Health Information</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-800">
                        <strong>Diabetes Status:</strong> {profile.hasDiabetes ? "Yes" : "No"}
                      </p>
                      <p className="text-gray-800">
                        <strong>Dietary Preference:</strong> {profile.dietaryPreference || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-700">Dietary Preferences & Allergies</Label>
                    <p className="text-sm text-gray-600 mb-2">Current allergies from your profile:</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.allergies && profile.allergies.length > 0 ? (
                        profile.allergies.map((allergy) => (
                          <Badge key={allergy} variant="secondary" className="bg-red-100 text-red-800">
                            {allergy}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No allergies specified</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Update your allergies:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        "Vegetarian",
                        "Vegan",
                        "Gluten-Free",
                        "Dairy-Free",
                        "Keto",
                        "Low-Carb",
                        "Nut Allergy",
                        "Shellfish Allergy",
                      ].map((pref) => (
                        <Badge
                          key={pref}
                          variant={editProfile.dietaryPreferences.includes(pref) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-blue-100"
                          onClick={() => {
                            const prefs = editProfile.dietaryPreferences.includes(pref)
                              ? editProfile.dietaryPreferences.filter((p) => p !== pref)
                              : [...editProfile.dietaryPreferences, pref]
                            setEditProfile({ ...editProfile, dietaryPreferences: prefs })
                          }}
                        >
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-700">Favorite Cuisines</Label>
                    <p className="text-sm text-gray-600 mb-2">Current favorite cuisines from your profile:</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.favoritesCuisines && profile.favoritesCuisines.length > 0 ? (
                        profile.favoritesCuisines.map((cuisine) => (
                          <Badge key={cuisine} variant="secondary" className="bg-green-100 text-green-800">
                            {cuisine}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No favorite cuisines specified</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Update your favorite cuisines:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["Italian", "Mexican", "Chinese", "Indian", "American", "Thai", "Japanese", "Mediterranean"].map(
                        (cuisine) => (
                          <Badge
                            key={cuisine}
                            variant={editProfile.favoritesCuisines.includes(cuisine) ? "default" : "outline"}
                            className="cursor-pointer hover:bg-blue-100"
                            onClick={() => {
                              const cuisines = editProfile.favoritesCuisines.includes(cuisine)
                                ? editProfile.favoritesCuisines.filter((c) => c !== cuisine)
                                : [...editProfile.favoritesCuisines, cuisine]
                              setEditProfile({ ...editProfile, favoritesCuisines: cuisines })
                            }}
                          >
                            {cuisine}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={updating}>
                    {updating ? "Updating Profile..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Clock className="w-5 h-5" />
                  Activity History
                </CardTitle>
                <CardDescription className="text-gray-600">Your recent searches and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {userActivities.length > 0 ? (
                  <div className="space-y-4">
                    {userActivities.map((activity) => (
                      <div key={activity._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div
                          className={`w-8 h-8 ${getTypeColor(activity.type)} rounded-full flex items-center justify-center text-white`}
                        >
                          {getTypeIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.details}</p>
                          <p className="text-sm text-gray-600 capitalize">
                            {activity.type} • {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No activity history yet</p>
                    <p className="text-sm text-gray-400">Start exploring to see your activity here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <MessageCircle className="w-5 h-5" />
                  My Feedback
                </CardTitle>
                <CardDescription className="text-gray-600">Your feedback and ratings</CardDescription>
              </CardHeader>
              <CardContent>
                {userFeedback.length > 0 ? (
                  <div className="space-y-4">
                    {userFeedback.map((feedback) => (
                      <div key={feedback._id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex">{getRatingStars(feedback.rating)}</div>
                            <Badge variant="outline" className="capitalize">
                              {feedback.category}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">{formatTimeAgo(feedback.timestamp)}</span>
                        </div>
                        <p className="text-gray-700">{feedback.feedback}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No feedback given yet</p>
                    <p className="text-sm text-gray-400">Your feedback helps us improve the experience</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your account preferences and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive updates about new features and recommendations</p>
                    </div>
                    <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-700 bg-transparent">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Location Services</h4>
                      <p className="text-sm text-gray-600">Allow location access for better recommendations</p>
                    </div>
                    <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-700 bg-transparent">
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Data Privacy</h4>
                      <p className="text-sm text-gray-600">Control how your data is used and stored</p>
                    </div>
                    <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-700 bg-transparent">
                      Review
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Account Security</h4>
                      <p className="text-sm text-gray-600">Change password and security settings</p>
                    </div>
                    <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-700 bg-transparent">
                      Update
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button variant="destructive" className="w-full hover:bg-red-700 hover:text-white">
                    Delete Account
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
