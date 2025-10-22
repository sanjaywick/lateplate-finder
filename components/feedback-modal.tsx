"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Star, MessageSquare, X, Send } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  module?: string
}

export function FeedbackModal({ isOpen, onClose, module = "general" }: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [aspect, setAspect] = useState<string>("")
  const [feedback, setFeedback] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setRating(0)
    setHoveredRating(0)
    setAspect("")
    setFeedback("")
    setIsSubmitting(false)
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before submitting",
        variant: "destructive",
      })
      return
    }

    if (!aspect) {
      toast({
        title: "Aspect Required",
        description: "Please select what aspect you'd like to comment on",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          rating,
          aspect,
          feedback,
          module,
          timestamp: new Date(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Thank you!",
          description: "Your feedback has been submitted successfully",
        })
        onClose()
        resetForm()
      } else {
        throw new Error("Failed to submit feedback")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md mx-auto my-8 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <button
                  onClick={onClose}
                  className="absolute top-0 right-0 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">We'd Love Your Feedback!</h2>
                  </div>
                </div>
                <p className="text-blue-100 text-sm">
                  Help us improve your LatePlate Finder experience with analytics-driven insights
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Rating Section */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-slate-700">How would you rate your experience?</Label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform hover:scale-110"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <span className="text-sm text-slate-500">
                    {rating > 0 && (
                      <>
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Aspect Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-slate-700">
                  What aspect would you like to comment on?
                </Label>
                <RadioGroup value={aspect} onValueChange={setAspect} className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <RadioGroupItem value="restaurant-search" id="restaurant-search" />
                    <Label htmlFor="restaurant-search" className="flex items-center gap-2 cursor-pointer">
                      <span className="text-lg">🍽️</span>
                      <span>Restaurant Search</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <RadioGroupItem value="recipe-recommendations" id="recipe-recommendations" />
                    <Label htmlFor="recipe-recommendations" className="flex items-center gap-2 cursor-pointer">
                      <span className="text-lg">👨‍🍳</span>
                      <span>Recipe Recommendations</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <RadioGroupItem value="grocery-finder" id="grocery-finder" />
                    <Label htmlFor="grocery-finder" className="flex items-center gap-2 cursor-pointer">
                      <span className="text-lg">🛒</span>
                      <span>Grocery Store Finder</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <RadioGroupItem value="overall-experience" id="overall-experience" />
                    <Label htmlFor="overall-experience" className="flex items-center gap-2 cursor-pointer">
                      <span className="text-lg">⭐</span>
                      <span>Overall Experience</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Feedback Text */}
              <div className="space-y-3">
                <Label htmlFor="feedback-text" className="text-base font-medium text-slate-700">
                  Tell us more about your experience
                </Label>
                <Textarea
                  id="feedback-text"
                  placeholder="What did you like? What could we improve? Any suggestions for better analytics?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px] resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-slate-300 hover:bg-slate-100 bg-transparent"
                  disabled={isSubmitting}
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || rating === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>Submit Feedback</span>
                    </div>
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500 text-center mt-3">
                Your feedback helps us improve our ML algorithms and user experience
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
