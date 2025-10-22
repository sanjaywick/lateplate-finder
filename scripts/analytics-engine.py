import pymongo
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import silhouette_score
from textblob import TextBlob
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import json
from collections import defaultdict, Counter
import warnings
warnings.filterwarnings('ignore')

# MongoDB connection
client = pymongo.MongoClient("mongodb+srv://sanjaywick:Sanjay1010@cluster0.c12pas1.mongodb.net/")
db = client["lateplate_finder"]

class LatePlateAnalyticsEngine:
    def __init__(self):
        self.db = db
        self.user_profiles = {}
        self.restaurant_data = {}
        self.recipe_data = {}
        
    def descriptive_analytics(self):
        """Comprehensive descriptive analytics of user behavior"""
        try:
            print("🔍 Running Descriptive Analytics...")
            
            # User behavior patterns
            users = list(self.db.users.find())
            location_logs = list(self.db.location_logs.find())
            search_logs = list(self.db.search_logs.find())
            
            analytics = {
                'user_demographics': self._analyze_user_demographics(users),
                'location_patterns': self._analyze_location_patterns(location_logs),
                'search_behavior': self._analyze_search_behavior(search_logs),
                'cuisine_preferences': self._analyze_cuisine_preferences(users),
                'temporal_patterns': self._analyze_temporal_patterns(search_logs),
                'device_usage': self._analyze_device_usage(location_logs),
                'geographic_distribution': self._analyze_geographic_distribution(location_logs),
                'user_engagement': self._analyze_user_engagement(users, search_logs)
            }
            
            # Store results
            self.db.analytics_results.update_one(
                {'type': 'descriptive'},
                {'$set': {'data': analytics, 'updated_at': datetime.now()}},
                upsert=True
            )
            
            print("✅ Descriptive Analytics completed")
            return analytics
            
        except Exception as e:
            print(f"❌ Error in descriptive analytics: {e}")
            return None
    
    def sentiment_analysis(self):
        """Analyze user feedback sentiment using NLP"""
        try:
            print("💭 Running Sentiment Analysis...")
            
            feedback_data = list(self.db.feedback.find())
            reviews = list(self.db.reviews.find())
            
            sentiments = {
                'feedback_sentiment': self._analyze_feedback_sentiment(feedback_data),
                'review_sentiment': self._analyze_review_sentiment(reviews),
                'satisfaction_trends': self._analyze_satisfaction_trends(feedback_data + reviews),
                'emotion_detection': self._detect_emotions(feedback_data + reviews),
                'keyword_analysis': self._analyze_keywords(feedback_data + reviews),
                'sentiment_by_cuisine': self._analyze_sentiment_by_cuisine(reviews),
                'temporal_sentiment': self._analyze_temporal_sentiment(feedback_data + reviews)
            }
            
            # Store results
            self.db.analytics_results.update_one(
                {'type': 'sentiment'},
                {'$set': {'data': sentiments, 'updated_at': datetime.now()}},
                upsert=True
            )
            
            print("✅ Sentiment Analysis completed")
            return sentiments
            
        except Exception as e:
            print(f"❌ Error in sentiment analysis: {e}")
            return None
    
    def user_clustering(self):
        """K-Means clustering for user segmentation"""
        try:
            print("👥 Running User Clustering...")
            
            users = list(self.db.users.find())
            location_logs = list(self.db.location_logs.find())
            search_logs = list(self.db.search_logs.find())
            
            # Prepare features for clustering
            features_data = self._prepare_clustering_features(users, location_logs, search_logs)
            
            if len(features_data) < 3:
                print("⚠️ Not enough data for clustering")
                return None
            
            # Create feature matrix
            feature_matrix = []
            user_ids = []
            
            for user_id, features in features_data.items():
                feature_matrix.append(list(features.values()))
                user_ids.append(user_id)
            
            feature_matrix = np.array(feature_matrix)
            
            # Normalize features
            scaler = StandardScaler()
            features_scaled = scaler.fit_transform(feature_matrix)
            
            # Determine optimal number of clusters
            optimal_k = self._find_optimal_clusters(features_scaled)
            
            # Perform K-means clustering
            kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
            clusters = kmeans.fit_predict(features_scaled)
            
            # Analyze clusters
            cluster_analysis = self._analyze_clusters(users, clusters, features_data, user_ids)
            
            # Store results
            self.db.analytics_results.update_one(
                {'type': 'clustering'},
                {'$set': {'data': cluster_analysis, 'updated_at': datetime.now()}},
                upsert=True
            )
            
            print("✅ User Clustering completed")
            return cluster_analysis
            
        except Exception as e:
            print(f"❌ Error in user clustering: {e}")
            return None
    
    def collaborative_filtering(self):
        """Collaborative filtering for recommendations"""
        try:
            print("🤝 Running Collaborative Filtering...")
            
            # Get user-item interactions
            interactions = self._get_user_interactions()
            
            if len(interactions) < 10:
                print("⚠️ Not enough interaction data for collaborative filtering")
                return self._generate_content_based_recommendations()
            
            # Create user-item matrix
            user_item_matrix = self._create_user_item_matrix(interactions)
            
            # Generate recommendations using matrix factorization
            recommendations = self._generate_collaborative_recommendations(user_item_matrix)
            
            # Store results
            self.db.analytics_results.update_one(
                {'type': 'collaborative_filtering'},
                {'$set': {'data': recommendations, 'updated_at': datetime.now()}},
                upsert=True
            )
            
            print("✅ Collaborative Filtering completed")
            return recommendations
            
        except Exception as e:
            print(f"❌ Error in collaborative filtering: {e}")
            return None
    
    def time_series_analysis(self):
        """Time series analysis for demand forecasting"""
        try:
            print("📈 Running Time Series Analysis...")
            
            search_logs = list(self.db.search_logs.find())
            location_logs = list(self.db.location_logs.find())
            
            # Analyze temporal patterns
            temporal_analysis = {
                'hourly_patterns': self._analyze_hourly_patterns(search_logs),
                'daily_patterns': self._analyze_daily_patterns(search_logs),
                'weekly_patterns': self._analyze_weekly_patterns(search_logs),
                'seasonal_trends': self._analyze_seasonal_trends(search_logs),
                'demand_forecasting': self._forecast_demand(search_logs),
                'peak_time_prediction': self._predict_peak_times(search_logs),
                'location_time_correlation': self._analyze_location_time_patterns(location_logs),
                'cuisine_time_preferences': self._analyze_cuisine_time_preferences(search_logs)
            }
            
            # Store results
            self.db.analytics_results.update_one(
                {'type': 'time_series'},
                {'$set': {'data': temporal_analysis, 'updated_at': datetime.now()}},
                upsert=True
            )
            
            print("✅ Time Series Analysis completed")
            return temporal_analysis
            
        except Exception as e:
            print(f"❌ Error in time series analysis: {e}")
            return None
    
    def decision_tree_recommendations(self):
        """Decision tree for fallback recommendations"""
        try:
            print("🌳 Running Decision Tree Analysis...")
            
            # Prepare training data
            training_data = self._prepare_decision_tree_data()
            
            if len(training_data) < 20:
                print("⚠️ Not enough data for decision tree training")
                return self._generate_rule_based_recommendations()
            
            # Extract features and labels
            X, y, feature_names = self._extract_features_labels(training_data)
            
            if len(X) == 0:
                return self._generate_rule_based_recommendations()
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train decision tree
            dt_classifier = DecisionTreeClassifier(
                random_state=42, 
                max_depth=10, 
                min_samples_split=5,
                min_samples_leaf=3
            )
            dt_classifier.fit(X_train, y_train)
            
            # Generate rules
            rules = self._extract_decision_rules(dt_classifier, feature_names)
            
            # Calculate accuracy
            train_accuracy = dt_classifier.score(X_train, y_train)
            test_accuracy = dt_classifier.score(X_test, y_test) if len(X_test) > 0 else 0
            
            decision_analysis = {
                'rules': rules,
                'model_performance': {
                    'train_accuracy': train_accuracy,
                    'test_accuracy': test_accuracy,
                    'feature_importance': dict(zip(feature_names, dt_classifier.feature_importances_))
                },
                'recommendation_logic': self._create_recommendation_logic(rules)
            }
            
            # Store results
            self.db.analytics_results.update_one(
                {'type': 'decision_tree'},
                {'$set': {'data': decision_analysis, 'updated_at': datetime.now()}},
                upsert=True
            )
            
            print("✅ Decision Tree Analysis completed")
            return decision_analysis
            
        except Exception as e:
            print(f"❌ Error in decision tree analysis: {e}")
            return None
    
    def association_rule_mining(self):
        """Association rule mining for ingredient combinations"""
        try:
            print("🔗 Running Association Rule Mining...")
            
            recipes = list(self.db.recipes.find())
            user_searches = list(self.db.search_logs.find({'type': 'recipe'}))
            
            # Extract ingredient associations
            associations = self._mine_ingredient_associations(recipes, user_searches)
            
            # Store results
            self.db.analytics_results.update_one(
                {'type': 'association_rules'},
                {'$set': {'data': associations, 'updated_at': datetime.now()}},
                upsert=True
            )
            
            print("✅ Association Rule Mining completed")
            return associations
            
        except Exception as e:
            print(f"❌ Error in association rule mining: {e}")
            return None
    
    def market_segmentation(self):
        """Advanced market segmentation analysis"""
        try:
            print("🎯 Running Market Segmentation...")
            
            users = list(self.db.users.find())
            location_logs = list(self.db.location_logs.find())
            search_logs = list(self.db.search_logs.find())
            
            segments = {
                'demographic_segments': self._segment_by_demographics(users),
                'behavioral_segments': self._segment_by_behavior(search_logs),
                'geographic_segments': self._segment_by_geography(location_logs),
                'psychographic_segments': self._segment_by_preferences(users),
                'value_segments': self._segment_by_value(users, search_logs),
                'temporal_segments': self._segment_by_time_patterns(search_logs),
                'cuisine_segments': self._segment_by_cuisine_preferences(users, search_logs)
            }
            
            # Store results
            self.db.analytics_results.update_one(
                {'type': 'market_segmentation'},
                {'$set': {'data': segments, 'updated_at': datetime.now()}},
                upsert=True
            )
            
            print("✅ Market Segmentation completed")
            return segments
            
        except Exception as e:
            print(f"❌ Error in market segmentation: {e}")
            return None
    
    def mood_based_recommendations(self):
        """AI-powered mood-based food recommendations"""
        try:
            print("😊 Running Mood-Based Recommendations...")
            
            # Analyze user behavior patterns to infer mood
            mood_patterns = self._analyze_mood_patterns()
            
            # Generate mood-based recommendations
            recommendations = self._generate_mood_recommendations(mood_patterns)
            
            # Store results
            self.db.analytics_results.update_one(
                {'type': 'mood_recommendations'},
                {'$set': {'data': recommendations, 'updated_at': datetime.now()}},
                upsert=True
            )
            
            print("✅ Mood-Based Recommendations completed")
            return recommendations
            
        except Exception as e:
            print(f"❌ Error in mood-based recommendations: {e}")
            return None
    
    def predictive_analytics(self):
        """Advanced predictive analytics for user behavior"""
        try:
            print("🔮 Running Predictive Analytics...")
            
            users = list(self.db.users.find())
            search_logs = list(self.db.search_logs.find())
            location_logs = list(self.db.location_logs.find())
            
            predictions = {
                'churn_prediction': self._predict_user_churn(users, search_logs),
                'demand_prediction': self._predict_demand_spikes(search_logs),
                'cuisine_trend_prediction': self._predict_cuisine_trends(search_logs),
                'location_preference_prediction': self._predict_location_preferences(location_logs),
                'seasonal_behavior_prediction': self._predict_seasonal_behavior(search_logs),
                'user_lifetime_value': self._predict_user_lifetime_value(users, search_logs)
            }
            
            # Store results
            self.db.analytics_results.update_one(
                {'type': 'predictive'},
                {'$set': {'data': predictions, 'updated_at': datetime.now()}},
                upsert=True
            )
            
            print("✅ Predictive Analytics completed")
            return predictions
            
        except Exception as e:
            print(f"❌ Error in predictive analytics: {e}")
            return None
    
    # Helper methods implementation
    def _analyze_user_demographics(self, users):
        """Analyze user demographic patterns"""
        demographics = {
            'total_users': len(users),
            'dietary_preferences': {},
            'diabetes_distribution': {'yes': 0, 'no': 0},
            'cuisine_preferences': {},
            'profile_completion_rate': 0,
            'allergies_distribution': {},
            'phone_verification_rate': 0
        }
        
        completed_profiles = 0
        verified_phones = 0
        
        for user in users:
            # Profile completion
            if user.get('preferences', {}).get('profileComplete'):
                completed_profiles += 1
            
            # Phone verification
            if user.get('preferences', {}).get('phone'):
                verified_phones += 1
            
            # Dietary preferences
            diet_pref = user.get('preferences', {}).get('dietaryPreference', 'unknown')
            demographics['dietary_preferences'][diet_pref] = demographics['dietary_preferences'].get(diet_pref, 0) + 1
            
            # Diabetes
            has_diabetes = user.get('preferences', {}).get('hasDiabetes', False)
            demographics['diabetes_distribution']['yes' if has_diabetes else 'no'] += 1
            
            # Cuisine preferences
            cuisines = user.get('preferences', {}).get('favoritesCuisines', [])
            for cuisine in cuisines:
                demographics['cuisine_preferences'][cuisine] = demographics['cuisine_preferences'].get(cuisine, 0) + 1
            
            # Allergies
            allergies = user.get('preferences', {}).get('allergies', [])
            for allergy in allergies:
                demographics['allergies_distribution'][allergy] = demographics['allergies_distribution'].get(allergy, 0) + 1
        
        demographics['profile_completion_rate'] = (completed_profiles / len(users)) * 100 if users else 0
        demographics['phone_verification_rate'] = (verified_phones / len(users)) * 100 if users else 0
        
        return demographics
    
    def _analyze_location_patterns(self, location_logs):
        """Analyze location usage patterns"""
        if not location_logs:
            return {'total_locations': 0, 'top_cities': [], 'location_sources': {}, 'accuracy_distribution': {}}
        
        city_counts = {}
        source_counts = {'geolocation': 0, 'manual': 0}
        accuracy_counts = {'high': 0, 'medium': 0, 'low': 0}
        
        for log in location_logs:
            # Extract city from address
            address = log.get('address', '')
            if ',' in address:
                city = address.split(',')[-2].strip() if len(address.split(',')) > 1 else 'Unknown'
            else:
                city = 'Unknown'
            
            city_counts[city] = city_counts.get(city, 0) + 1
            
            # Source analysis
            source = log.get('source', 'unknown')
            if source in source_counts:
                source_counts[source] += 1
            
            # Accuracy analysis
            accuracy = log.get('accuracy', 'unknown')
            if accuracy in accuracy_counts:
                accuracy_counts[accuracy] += 1
        
        top_cities = sorted(city_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            'total_locations': len(location_logs),
            'unique_cities': len(city_counts),
            'top_cities': top_cities,
            'location_sources': source_counts,
            'accuracy_distribution': accuracy_counts
        }
    
    def _analyze_search_behavior(self, search_logs):
        """Analyze search behavior patterns"""
        if not search_logs:
            return {'total_searches': 0, 'search_types': {}, 'popular_queries': [], 'search_frequency': {}}
        
        search_types = {}
        query_counts = {}
        hourly_searches = {str(i): 0 for i in range(24)}
        
        for log in search_logs:
            search_type = log.get('type', 'unknown')
            search_types[search_type] = search_types.get(search_type, 0) + 1
            
            query = log.get('query', '').lower()
            if query:
                query_counts[query] = query_counts.get(query, 0) + 1
            
            # Hourly distribution
            timestamp = log.get('timestamp')
            if timestamp:
                if isinstance(timestamp, str):
                    timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                hour = str(timestamp.hour)
                hourly_searches[hour] += 1
        
        popular_queries = sorted(query_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            'total_searches': len(search_logs),
            'search_types': search_types,
            'popular_queries': popular_queries,
            'hourly_distribution': hourly_searches
        }
    
    def _analyze_cuisine_preferences(self, users):
        """Analyze cuisine preference patterns"""
        cuisine_stats = {}
        
        for user in users:
            cuisines = user.get('preferences', {}).get('favoritesCuisines', [])
            for cuisine in cuisines:
                if cuisine not in cuisine_stats:
                    cuisine_stats[cuisine] = {'count': 0, 'users': [], 'dietary_correlation': {}}
                cuisine_stats[cuisine]['count'] += 1
                cuisine_stats[cuisine]['users'].append(str(user.get('_id')))
                
                # Correlate with dietary preferences
                diet_pref = user.get('preferences', {}).get('dietaryPreference', 'unknown')
                if diet_pref not in cuisine_stats[cuisine]['dietary_correlation']:
                    cuisine_stats[cuisine]['dietary_correlation'][diet_pref] = 0
                cuisine_stats[cuisine]['dietary_correlation'][diet_pref] += 1
        
        return cuisine_stats
    
    def _analyze_temporal_patterns(self, search_logs):
        """Analyze temporal search patterns"""
        if not search_logs:
            return {'hourly_distribution': {}, 'daily_distribution': {}, 'monthly_trends': {}}
        
        hourly_counts = {str(i): 0 for i in range(24)}
        daily_counts = {str(i): 0 for i in range(7)}
        monthly_counts = {}
        
        for log in search_logs:
            timestamp = log.get('timestamp')
            if timestamp:
                if isinstance(timestamp, str):
                    timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                
                hour = str(timestamp.hour)
                day = str(timestamp.weekday())
                month = timestamp.strftime('%Y-%m')
                
                hourly_counts[hour] += 1
                daily_counts[day] += 1
                monthly_counts[month] = monthly_counts.get(month, 0) + 1
        
        return {
            'hourly_distribution': hourly_counts,
            'daily_distribution': daily_counts,
            'monthly_trends': monthly_counts
        }
    
    def _analyze_device_usage(self, location_logs):
        """Analyze device usage patterns"""
        if not location_logs:
            return {'mobile': 0, 'desktop': 0, 'unknown': 0}
        
        device_counts = {'mobile': 0, 'desktop': 0, 'unknown': 0}
        
        for log in location_logs:
            user_agent = log.get('userAgent', '').lower()
            if 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent:
                device_counts['mobile'] += 1
            elif 'desktop' in user_agent or 'windows' in user_agent or 'macintosh' in user_agent:
                device_counts['desktop'] += 1
            else:
                device_counts['unknown'] += 1
        
        return device_counts
    
    def _analyze_geographic_distribution(self, location_logs):
        """Analyze geographic distribution of users"""
        if not location_logs:
            return {'countries': {}, 'regions': {}, 'coordinates': []}
        
        countries = {}
        regions = {}
        coordinates = []
        
        for log in location_logs:
            # Extract country and region info
            address = log.get('address', '')
            lat = log.get('latitude', 0)
            lng = log.get('longitude', 0)
            
            if lat and lng:
                coordinates.append({'lat': lat, 'lng': lng})
            
            # Simple country detection based on address
            if 'india' in address.lower():
                countries['India'] = countries.get('India', 0) + 1
                # Extract state/region for India
                parts = address.split(',')
                if len(parts) > 1:
                    region = parts[-2].strip()
                    regions[region] = regions.get(region, 0) + 1
            else:
                countries['Other'] = countries.get('Other', 0) + 1
        
        return {
            'countries': countries,
            'regions': regions,
            'coordinates': coordinates[:100]  # Limit for performance
        }
    
    def _analyze_user_engagement(self, users, search_logs):
        """Analyze user engagement patterns"""
        user_activity = {}
        
        # Count searches per user
        for log in search_logs:
            user_id = str(log.get('user_id', 'anonymous'))
            user_activity[user_id] = user_activity.get(user_id, 0) + 1
        
        # Categorize users by engagement level
        engagement_levels = {'high': 0, 'medium': 0, 'low': 0, 'inactive': 0}
        
        for user in users:
            user_id = str(user.get('_id'))
            activity_count = user_activity.get(user_id, 0)
            
            if activity_count >= 20:
                engagement_levels['high'] += 1
            elif activity_count >= 10:
                engagement_levels['medium'] += 1
            elif activity_count >= 1:
                engagement_levels['low'] += 1
            else:
                engagement_levels['inactive'] += 1
        
        return {
            'engagement_distribution': engagement_levels,
            'average_searches_per_user': np.mean(list(user_activity.values())) if user_activity else 0,
            'total_active_users': len([u for u in user_activity.values() if u > 0])
        }
    
    def _analyze_feedback_sentiment(self, feedback_data):
        """Analyze sentiment of user feedback"""
        if not feedback_data:
            return {'positive': 0, 'negative': 0, 'neutral': 0, 'average_sentiment': 0}
        
        sentiments = {'positive': 0, 'negative': 0, 'neutral': 0}
        sentiment_scores = []
        
        for feedback in feedback_data:
            comment = feedback.get('comment', '')
            if comment:
                blob = TextBlob(comment)
                polarity = blob.sentiment.polarity
                sentiment_scores.append(polarity)
                
                if polarity > 0.1:
                    sentiments['positive'] += 1
                elif polarity < -0.1:
                    sentiments['negative'] += 1
                else:
                    sentiments['neutral'] += 1
        
        avg_sentiment = np.mean(sentiment_scores) if sentiment_scores else 0
        
        return {
            **sentiments,
            'average_sentiment': avg_sentiment,
            'total_feedback': len(feedback_data),
            'sentiment_distribution': {k: (v/len(feedback_data))*100 for k, v in sentiments.items()}
        }
    
    def _analyze_review_sentiment(self, reviews):
        """Analyze sentiment of reviews"""
        return self._analyze_feedback_sentiment(reviews)  # Same logic
    
    def _analyze_satisfaction_trends(self, all_feedback):
        """Analyze satisfaction trends over time"""
        if not all_feedback:
            return {'trend': 'stable', 'monthly_scores': {}}
        
        monthly_scores = {}
        
        for feedback in all_feedback:
            timestamp = feedback.get('timestamp')
            rating = feedback.get('rating', 0)
            
            if timestamp and rating:
                if isinstance(timestamp, str):
                    timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                
                month_key = timestamp.strftime('%Y-%m')
                if month_key not in monthly_scores:
                    monthly_scores[month_key] = []
                monthly_scores[month_key].append(rating)
        
        # Calculate average scores per month
        avg_monthly_scores = {}
        for month, scores in monthly_scores.items():
            avg_monthly_scores[month] = np.mean(scores)
        
        # Determine trend
        trend = 'stable'
        if len(avg_monthly_scores) > 1:
            scores_list = list(avg_monthly_scores.values())
            if scores_list[-1] > scores_list[0]:
                trend = 'improving'
            elif scores_list[-1] < scores_list[0]:
                trend = 'declining'
        
        return {
            'monthly_scores': avg_monthly_scores,
            'trend': trend,
            'overall_satisfaction': np.mean(list(avg_monthly_scores.values())) if avg_monthly_scores else 0
        }
    
    def _detect_emotions(self, feedback_data):
        """Detect emotions in feedback using keyword analysis"""
        emotions = {
            'joy': ['happy', 'great', 'excellent', 'amazing', 'love', 'wonderful', 'fantastic', 'awesome'],
            'anger': ['angry', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disgusting', 'furious'],
            'sadness': ['sad', 'disappointed', 'bad', 'poor', 'unsatisfied', 'depressed', 'upset'],
            'surprise': ['surprised', 'unexpected', 'wow', 'incredible', 'shocking', 'unbelievable'],
            'fear': ['worried', 'concerned', 'afraid', 'nervous', 'anxious', 'scared'],
            'trust': ['reliable', 'trustworthy', 'dependable', 'consistent', 'professional'],
            'anticipation': ['excited', 'looking forward', 'eager', 'hopeful', 'optimistic']
        }
        
        emotion_counts = {emotion: 0 for emotion in emotions.keys()}
        
        for feedback in feedback_data:
            comment = feedback.get('comment', '').lower()
            for emotion, keywords in emotions.items():
                if any(keyword in comment for keyword in keywords):
                    emotion_counts[emotion] += 1
        
        return emotion_counts
    
    def _analyze_keywords(self, feedback_data):
        """Analyze most common keywords in feedback"""
        all_words = []
        
        for feedback in feedback_data:
            comment = feedback.get('comment', '')
            if comment:
                # Simple word extraction (could be enhanced with NLP)
                words = comment.lower().split()
                # Filter out common stop words
                stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'}
                filtered_words = [word for word in words if word not in stop_words and len(word) > 2]
                all_words.extend(filtered_words)
        
        word_counts = Counter(all_words)
        return dict(word_counts.most_common(20))
    
    def _prepare_clustering_features(self, users, location_logs, search_logs):
        """Prepare features for user clustering"""
        features_data = {}
        
        # Create user activity maps
        user_locations = {}
        user_searches = {}
        
        for log in location_logs:
            user_id = str(log.get('user_id', 'anonymous'))
            if user_id not in user_locations:
                user_locations[user_id] = []
            user_locations[user_id].append(log)
        
        for log in search_logs:
            user_id = str(log.get('user_id', 'anonymous'))
            if user_id not in user_searches:
                user_searches[user_id] = []
            user_searches[user_id].append(log)
        
        for user in users:
            user_id = str(user.get('_id'))
            
            # Basic user features
            features = {
                'has_diabetes': 1 if user.get('preferences', {}).get('hasDiabetes') else 0,
                'profile_complete': 1 if user.get('preferences', {}).get('profileComplete') else 0,
                'num_favorite_cuisines': len(user.get('preferences', {}).get('favoritesCuisines', [])),
                'has_allergies': 1 if user.get('preferences', {}).get('allergies') else 0,
                'dietary_preference_score': self._encode_dietary_preference(user.get('preferences', {}).get('dietaryPreference')),
                'location_searches': len(user_locations.get(user_id, [])),
                'total_searches': len(user_searches.get(user_id, [])),
                'avg_search_hour': self._calculate_avg_search_hour(user_searches.get(user_id, [])),
                'search_variety': len(set([s.get('type') for s in user_searches.get(user_id, [])])),
                'location_variety': len(set([l.get('address') for l in user_locations.get(user_id, [])]))
            }
            
            features_data[user_id] = features
        
        return features_data
    
    def _encode_dietary_preference(self, pref):
        """Encode dietary preference as numeric value"""
        encoding = {
            'vegetarian': 1,
            'non-vegetarian': 2,
            'vegan': 3,
            'pescatarian': 4,
            'keto': 5,
            'paleo': 6
        }
        return encoding.get(pref, 0)
    
    def _calculate_avg_search_hour(self, searches):
        """Calculate average hour of searches"""
        if not searches:
            return 12  # Default to noon
        
        hours = []
        for search in searches:
            timestamp = search.get('timestamp')
            if timestamp:
                if isinstance(timestamp, str):
                    timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                hours.append(timestamp.hour)
        
        return np.mean(hours) if hours else 12
    
    def _find_optimal_clusters(self, features_scaled):
        """Find optimal number of clusters using silhouette score"""
        if len(features_scaled) < 4:
            return 2
        
        max_k = min(8, len(features_scaled) - 1)
        best_score = -1
        best_k = 2
        
        for k in range(2, max_k + 1):
            try:
                kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
                cluster_labels = kmeans.fit_predict(features_scaled)
                score = silhouette_score(features_scaled, cluster_labels)
                
                if score > best_score:
                    best_score = score
                    best_k = k
            except:
                continue
        
        return best_k
    
    def _analyze_clusters(self, users, clusters, features_data, user_ids):
        """Analyze the characteristics of each cluster"""
        cluster_analysis = {
            'num_clusters': len(set(clusters)),
            'cluster_sizes': {},
            'cluster_characteristics': {}
        }
        
        # Count cluster sizes
        for cluster_id in clusters:
            cluster_analysis['cluster_sizes'][str(cluster_id)] = cluster_analysis['cluster_sizes'].get(str(cluster_id), 0) + 1
        
        # Analyze each cluster
        for cluster_id in set(clusters):
            cluster_users = [user_ids[i] for i, c in enumerate(clusters) if c == cluster_id]
            cluster_features = [features_data[user_id] for user_id in cluster_users]
            
            # Calculate average features for this cluster
            avg_features = {}
            for feature_name in cluster_features[0].keys():
                avg_features[feature_name] = np.mean([f[feature_name] for f in cluster_features])
            
            # Determine cluster characteristics
            characteristics = []
            if avg_features['has_diabetes'] > 0.5:
                characteristics.append('Health-conscious')
            if avg_features['num_favorite_cuisines'] > 2:
                characteristics.append('Diverse food preferences')
            if avg_features['total_searches'] > 10:
                characteristics.append('Active users')
            if avg_features['avg_search_hour'] > 22 or avg_features['avg_search_hour'] < 6:
                characteristics.append('Night owls')
            if avg_features['location_variety'] > 3:
                characteristics.append('Mobile users')
            
            cluster_analysis['cluster_characteristics'][str(cluster_id)] = {
                'size': len(cluster_users),
                'avg_features': avg_features,
                'characteristics': characteristics,
                'user_sample': cluster_users[:5]  # Sample users for reference
            }
        
        return cluster_analysis
    
    def run_complete_analysis(self):
        """Run all analytics modules"""
        print("🚀 Starting Complete Analytics Engine...")
        
        results = {
            'descriptive': self.descriptive_analytics(),
            'sentiment': self.sentiment_analysis(),
            'clustering': self.user_clustering(),
            'collaborative_filtering': self.collaborative_filtering(),
            'time_series': self.time_series_analysis(),
            'decision_tree': self.decision_tree_recommendations(),
            'association_rules': self.association_rule_mining(),
            'market_segmentation': self.market_segmentation(),
            'mood_recommendations': self.mood_based_recommendations(),
            'predictive': self.predictive_analytics()
        }
        
        # Store comprehensive results
        self.db.analytics_results.update_one(
            {'type': 'complete_analysis'},
            {'$set': {'data': results, 'updated_at': datetime.now()}},
            upsert=True
        )
        
        print("🎉 Complete Analytics Engine finished!")
        return results

if __name__ == "__main__":
    engine = LatePlateAnalyticsEngine()
    results = engine.run_complete_analysis()
    print("Analytics results stored in database.")
