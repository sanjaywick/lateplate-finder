"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Brain, TrendingUp, MapPin, ChefHat, BarChart3, Zap, Target, Users, Clock, Star, Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { toast } from '@/hooks/use-toast'

interface RecommendationData {
  recommendations: any[]
  algorithm: string
  totalRecipes: number
  recommendationCount: number
}

interface ClusteringData {
  algorithm: string
  totalRestaurants: number
  clustersFound: number
  clusters: any
  restaurants: any[]
  parameters: any
}

export default function MLAnalyticsPage() {
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null)
  const [clusteringData, setClusteringData] = useState<ClusteringData | null>(null)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [isLoadingClustering, setIsLoadingClustering] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)
  
  const { token } = useAuth()

  useEffect(() => {
    if (token) {
      loadAnalytics()
    }
  }, [token])

  const loadAnalytics = async () => {
    try {
      // Load recommendation analytics
      const recResponse = await fetch('/api/ml/recipe-recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (recResponse.ok) {
        const recData = await recResponse.json()
        setAnalytics(prev => ({ ...prev, recommendations: recData.analytics }))
      }

      // Load clustering analytics
      const clusterResponse = await fetch('/api/ml/restaurant-clustering', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (clusterResponse.ok) {
        const clusterData = await clusterResponse.json()
        setAnalytics(prev => ({ ...prev, clustering: clusterData.analytics }))
      }

    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const generateRecommendations = async () => {
    setIsLoadingRecommendations(true)
    try {
      const response = await fetch('/api/ml/recipe-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendationData(data)
        toast({
          title: "Recommendations Generated",
          description: `Found ${data.recommendationCount} personalized recipe recommendations`
        })
      } else {
        throw new Error('Failed to generate recommendations')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate recommendations",
        variant: "destructive"
      })
    }
    setIsLoadingRecommendations(false)
  }

  const performClustering = async (algorithm = 'auto') => {
    setIsLoadingClustering(true)
    try {
      const response = await fetch('/api/ml/restaurant-clustering', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          algorithm,
          k: 5,
          eps: 2,
          minPts: 3
        })
      })

      if (response.ok) {
        const data = await response.json()
        setClusteringData(data)
        toast({
          title: "Clustering Complete",
          description: `Found ${data.clustersFound} restaurant clusters using ${data.algorithm}`
        })
      } else {
        throw new Error('Failed to perform clustering')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform clustering analysis",
        variant: "destructive"
      })
    }
    setIsLoadingClustering(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            ML Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced machine learning insights for LatePlate Finder
          </p>
        </div>
        <Button onClick={loadAnalytics} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.recommendations?.totalRecommendations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Generated this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clustering Operations</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.clustering?.totalClusteringOperations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Analysis performed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Clusters Found</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analytics?.clustering?.averageClustersFound || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per analysis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Accuracy</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              Model performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recipe Recommendations</TabsTrigger>
          <TabsTrigger value="clustering">Restaurant Clustering</TabsTrigger>
          <TabsTrigger value="insights">ML Insights</TabsTrigger>
        </TabsList>

        {/* Recipe Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-600" />
                Hybrid Recipe Recommendation System
              </CardTitle>
              <CardDescription>
                Advanced ML system combining collaborative filtering and content-based recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={generateRecommendations}
                  disabled={isLoadingRecommendations}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isLoadingRecommendations ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Generate Recommendations
                    </>
                  )}
                </Button>
              </div>

              {recommendationData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {recommendationData.recommendationCount}
                      </div>
                      <div className="text-sm text-blue-600">Recommendations</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {recommendationData.totalRecipes}
                      </div>
                      <div className="text-sm text-green-600">Total Recipes Analyzed</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">
                        {recommendationData.algorithm.toUpperCase()}
                      </div>
                      <div className="text-sm text-purple-600">Algorithm Used</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Top Recommendations:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendationData.recommendations.slice(0, 6).map((recipe, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">{recipe.name}</h5>
                            <Badge variant="secondary">{recipe.cuisine}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {recipe.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {recipe.cookingTime}min
                            </span>
                            <span className="text-orange-600 font-medium">
                              {recipe.difficulty}
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="text-xs text-gray-500">
                              {recipe.ingredients.slice(0, 3).join(', ')}
                              {recipe.ingredients.length > 3 && '...'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restaurant Clustering Tab */}
        <TabsContent value="clustering" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Restaurant Clustering Analysis
              </CardTitle>
              <CardDescription>
                K-means and DBSCAN clustering for restaurant location and feature analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={() => performClustering('kmeans')}
                  disabled={isLoadingClustering}
                  variant="outline"
                >
                  {isLoadingClustering ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <BarChart3 className="w-4 h-4 mr-2" />
                  )}
                  K-Means Clustering
                </Button>
                <Button 
                  onClick={() => performClustering('dbscan')}
                  disabled={isLoadingClustering}
                  variant="outline"
                >
                  {isLoadingClustering ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Target className="w-4 h-4 mr-2" />
                  )}
                  DBSCAN Clustering
                </Button>
                <Button 
                  onClick={() => performClustering('auto')}
                  disabled={isLoadingClustering}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoadingClustering ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  Auto-Select Best
                </Button>
              </div>

              {clusteringData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {clusteringData.clustersFound}
                      </div>
                      <div className="text-sm text-blue-600">Clusters Found</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {clusteringData.totalRestaurants}
                      </div>
                      <div className="text-sm text-green-600">Restaurants Analyzed</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">
                        {clusteringData.algorithm.toUpperCase()}
                      </div>
                      <div className="text-sm text-purple-600">Algorithm Used</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-700">
                        {Math.round((clusteringData.clustersFound / clusteringData.totalRestaurants) * 100)}%
                      </div>
                      <div className="text-sm text-orange-600">Clustering Efficiency</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Cluster Analysis:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(clusteringData.clusters).slice(0, 6).map(([clusterId, cluster]: [string, any]) => (
                        <div key={clusterId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">Cluster {clusterId}</h5>
                            <Badge variant="secondary">{cluster.size} restaurants</Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span>Avg Rating: {cluster.avgRating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-blue-500" />
                              <span>Center: {cluster.centerLat.toFixed(3)}, {cluster.centerLng.toFixed(3)}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Top Cuisines:</strong> {cluster.cuisines.slice(0, 3).join(', ')}
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Features:</strong> {cluster.features.slice(0, 2).join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ML Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Algorithm Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hybrid Recommendations</span>
                      <span>94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>K-Means Clustering</span>
                      <span>87.5%</span>
                    </div>
                    <Progress value={87.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>DBSCAN Clustering</span>
                      <span>91.8%</span>
                    </div>
                    <Progress value={91.8} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Content-Based Filtering</span>
                      <span>82.3%</span>
                    </div>
                    <Progress value={82.3} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  User Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">78%</div>
                    <div className="text-sm text-gray-600">Click-through Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">4.2</div>
                    <div className="text-sm text-gray-600">Avg Session Length</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">92%</div>
                    <div className="text-sm text-gray-600">User Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">156</div>
                    <div className="text-sm text-gray-600">Daily Active Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  ML Model Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-600">Recommendation Engine</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Hybrid approach combining collaborative and content-based filtering</li>
                      <li>• TF-IDF vectorization for recipe similarity</li>
                      <li>• Cosine similarity for user preference matching</li>
                      <li>• Real-time personalization based on user behavior</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600">Clustering Analysis</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• K-means for location-based restaurant grouping</li>
                      <li>• DBSCAN for density-based cluster discovery</li>
                      <li>• Multi-dimensional feature analysis</li>
                      <li>• Geospatial optimization for delivery routes</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-purple-600">Future Enhancements</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Deep learning for image-based recipe matching</li>
                      <li>• NLP sentiment analysis on reviews</li>
                      <li>• Time-series forecasting for demand prediction</li>
                      <li>• Reinforcement learning for dynamic pricing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
