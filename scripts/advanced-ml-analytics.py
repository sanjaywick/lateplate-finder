#!/usr/bin/env python3
"""
Advanced ML Analytics Script for LatePlate Finder
Implements deep learning and advanced analytics for recipe and restaurant data
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, mean_squared_error, silhouette_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import PCA
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Embedding, LSTM, Conv1D, MaxPooling1D, Flatten
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pymongo
import json
import warnings
warnings.filterwarnings('ignore')

class LatePlateMLAnalytics:
    def __init__(self, mongo_uri="mongodb://localhost:27017", db_name="lateplate"):
        """Initialize the ML analytics system"""
        self.client = pymongo.MongoClient(mongo_uri)
        self.db = self.client[db_name]
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        
        print("🚀 LatePlate ML Analytics System Initialized")
        print("=" * 50)
    
    def load_data(self):
        """Load data from MongoDB collections"""
        print("📊 Loading data from MongoDB...")
        
        # Load recipes
        recipes_cursor = self.db.recipes.find({})
        self.recipes_df = pd.DataFrame(list(recipes_cursor))
        
        # Load restaurants
        restaurants_cursor = self.db.restaurants.find({})
        self.restaurants_df = pd.DataFrame(list(restaurants_cursor))
        
        # Load user activities
        activities_cursor = self.db.userActivities.find({})
        self.activities_df = pd.DataFrame(list(activities_cursor))
        
        # Load user feedback
        feedback_cursor = self.db.feedback.find({})
        self.feedback_df = pd.DataFrame(list(feedback_cursor))
        
        print(f"✅ Loaded {len(self.recipes_df)} recipes")
        print(f"✅ Loaded {len(self.restaurants_df)} restaurants")
        print(f"✅ Loaded {len(self.activities_df)} user activities")
        print(f"✅ Loaded {len(self.feedback_df)} feedback entries")
        print()
    
    def recipe_recommendation_deep_learning(self):
        """Advanced recipe recommendation using deep learning"""
        print("🧠 Building Deep Learning Recipe Recommendation Model...")
        
        if self.recipes_df.empty:
            print("❌ No recipe data available")
            return
        
        # Prepare text data for deep learning
        recipe_texts = []
        for _, recipe in self.recipes_df.iterrows():
            text = f"{recipe.get('name', '')} {' '.join(recipe.get('ingredients', []))} {recipe.get('cuisine', '')} {' '.join(recipe.get('tags', []))}"
            recipe_texts.append(text.lower())
        
        # Tokenization and sequence preparation
        tokenizer = Tokenizer(num_words=5000, oov_token="<OOV>")
        tokenizer.fit_on_texts(recipe_texts)
        sequences = tokenizer.texts_to_sequences(recipe_texts)
        padded_sequences = pad_sequences(sequences, maxlen=100, padding='post')
        
        # Create target variable (recipe rating)
        ratings = self.recipes_df['rating'].fillna(3.0).values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            padded_sequences, ratings, test_size=0.2, random_state=42
        )
        
        # Build deep learning model
        model = Sequential([
            Embedding(5000, 128, input_length=100),
            Conv1D(64, 5, activation='relu'),
            MaxPooling1D(pool_size=4),
            LSTM(64, dropout=0.5, recurrent_dropout=0.5),
            Dense(32, activation='relu'),
            Dropout(0.5),
            Dense(1, activation='linear')
        ])
        
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        # Train model
        print("🔄 Training deep learning model...")
        history = model.fit(
            X_train, y_train,
            batch_size=32,
            epochs=20,
            validation_data=(X_test, y_test),
            verbose=0
        )
        
        # Evaluate model
        test_loss, test_mae = model.evaluate(X_test, y_test, verbose=0)
        print(f"✅ Deep Learning Model - Test MAE: {test_mae:.4f}")
        
        # Generate predictions for all recipes
        predictions = model.predict(padded_sequences, verbose=0)
        
        # Create recommendation results
        recommendations = []
        for i, (_, recipe) in enumerate(self.recipes_df.iterrows()):
            recommendations.append({
                'recipe_id': str(recipe.get('_id', '')),
                'name': recipe.get('name', ''),
                'predicted_rating': float(predictions[i][0]),
                'actual_rating': float(recipe.get('rating', 0)),
                'cuisine': recipe.get('cuisine', ''),
                'difficulty': recipe.get('difficulty', ''),
                'cooking_time': recipe.get('cookingTime', 0)
            })
        
        # Sort by predicted rating
        recommendations.sort(key=lambda x: x['predicted_rating'], reverse=True)
        
        # Save results
        self.save_ml_results('deep_learning_recommendations', {
            'model_performance': {
                'test_mae': float(test_mae),
                'test_loss': float(test_loss)
            },
            'top_recommendations': recommendations[:20],
            'model_architecture': 'CNN-LSTM Hybrid',
            'training_samples': len(X_train)
        })
        
        print(f"🎯 Generated {len(recommendations)} recipe recommendations")
        print()
    
    def restaurant_clustering_analysis(self):
        """Advanced restaurant clustering with multiple algorithms"""
        print("🗺️  Performing Advanced Restaurant Clustering Analysis...")
        
        if self.restaurants_df.empty:
            print("❌ No restaurant data available")
            return
        
        # Prepare features for clustering
        features = []
        for _, restaurant in self.restaurants_df.iterrows():
            feature_vector = [
                restaurant.get('latitude', 0),
                restaurant.get('longitude', 0),
                restaurant.get('rating', 0),
                restaurant.get('priceLevel', 0),
                len(restaurant.get('cuisine', [])),
                restaurant.get('reviewCount', 0)
            ]
            features.append(feature_vector)
        
        features_df = pd.DataFrame(features, columns=[
            'latitude', 'longitude', 'rating', 'price_level', 'cuisine_count', 'review_count'
        ])
        
        # Standardize features
        features_scaled = self.scaler.fit_transform(features_df)
        
        # K-Means Clustering
        print("🔄 Performing K-Means clustering...")
        kmeans_results = {}
        silhouette_scores = []
        
        for k in range(2, 11):
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(features_scaled)
            silhouette_avg = silhouette_score(features_scaled, cluster_labels)
            silhouette_scores.append(silhouette_avg)
            
            if k == 5:  # Optimal k
                kmeans_results = {
                    'n_clusters': k,
                    'silhouette_score': silhouette_avg,
                    'cluster_centers': kmeans.cluster_centers_.tolist(),
                    'labels': cluster_labels.tolist()
                }
        
        # DBSCAN Clustering
        print("🔄 Performing DBSCAN clustering...")
        dbscan = DBSCAN(eps=0.5, min_samples=5)
        dbscan_labels = dbscan.fit_predict(features_scaled)
        
        n_clusters_dbscan = len(set(dbscan_labels)) - (1 if -1 in dbscan_labels else 0)
        n_noise = list(dbscan_labels).count(-1)
        
        dbscan_results = {
            'n_clusters': n_clusters_dbscan,
            'n_noise_points': n_noise,
            'labels': dbscan_labels.tolist()
        }
        
        # Analyze clusters
        cluster_analysis = self.analyze_restaurant_clusters(features_df, kmeans_results['labels'])
        
        # Save results
        self.save_ml_results('restaurant_clustering', {
            'kmeans_results': kmeans_results,
            'dbscan_results': dbscan_results,
            'cluster_analysis': cluster_analysis,
            'silhouette_scores': silhouette_scores,
            'optimal_k': 5
        })
        
        print(f"✅ K-Means found {kmeans_results['n_clusters']} clusters")
        print(f"✅ DBSCAN found {n_clusters_dbscan} clusters with {n_noise} noise points")
        print()
    
    def analyze_restaurant_clusters(self, features_df, labels):
        """Analyze restaurant clusters and generate insights"""
        cluster_analysis = {}
        
        for cluster_id in set(labels):
            cluster_mask = np.array(labels) == cluster_id
            cluster_data = features_df[cluster_mask]
            
            cluster_analysis[f'cluster_{cluster_id}'] = {
                'size': int(cluster_data.shape[0]),
                'avg_rating': float(cluster_data['rating'].mean()),
                'avg_price_level': float(cluster_data['price_level'].mean()),
                'avg_review_count': float(cluster_data['review_count'].mean()),
                'center_lat': float(cluster_data['latitude'].mean()),
                'center_lng': float(cluster_data['longitude'].mean()),
                'rating_std': float(cluster_data['rating'].std()),
                'geographic_spread': float(np.sqrt(
                    cluster_data['latitude'].var() + cluster_data['longitude'].var()
                ))
            }
        
        return cluster_analysis
    
    def sentiment_analysis_deep_learning(self):
        """Deep learning sentiment analysis on user feedback"""
        print("💭 Performing Deep Learning Sentiment Analysis...")
        
        if self.feedback_df.empty:
            print("❌ No feedback data available")
            return
        
        # Prepare text data
        feedback_texts = self.feedback_df['message'].fillna('').tolist()
        
        # Create sentiment labels (simplified - in real scenario, you'd have labeled data)
        # For demo, we'll use rating as proxy for sentiment
        ratings = self.feedback_df['rating'].fillna(3).values
        sentiments = ['negative' if r < 3 else 'neutral' if r == 3 else 'positive' for r in ratings]
        
        # Encode labels
        sentiment_encoded = self.label_encoder.fit_transform(sentiments)
        
        # Tokenization
        tokenizer = Tokenizer(num_words=3000, oov_token="<OOV>")
        tokenizer.fit_on_texts(feedback_texts)
        sequences = tokenizer.texts_to_sequences(feedback_texts)
        padded_sequences = pad_sequences(sequences, maxlen=50, padding='post')
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            padded_sequences, sentiment_encoded, test_size=0.2, random_state=42
        )
        
        # Build sentiment analysis model
        model = Sequential([
            Embedding(3000, 64, input_length=50),
            LSTM(32, dropout=0.3, recurrent_dropout=0.3),
            Dense(16, activation='relu'),
            Dropout(0.5),
            Dense(3, activation='softmax')  # 3 classes: negative, neutral, positive
        ])
        
        model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        # Train model
        print("🔄 Training sentiment analysis model...")
        history = model.fit(
            X_train, y_train,
            batch_size=16,
            epochs=15,
            validation_data=(X_test, y_test),
            verbose=0
        )
        
        # Evaluate model
        test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=0)
        
        # Generate predictions
        predictions = model.predict(padded_sequences, verbose=0)
        predicted_sentiments = np.argmax(predictions, axis=1)
        
        # Analyze sentiment distribution
        sentiment_distribution = {
            'negative': int(np.sum(predicted_sentiments == 0)),
            'neutral': int(np.sum(predicted_sentiments == 1)),
            'positive': int(np.sum(predicted_sentiments == 2))
        }
        
        # Save results
        self.save_ml_results('sentiment_analysis', {
            'model_performance': {
                'test_accuracy': float(test_accuracy),
                'test_loss': float(test_loss)
            },
            'sentiment_distribution': sentiment_distribution,
            'total_feedback_analyzed': len(feedback_texts),
            'model_architecture': 'LSTM-based Sentiment Classifier'
        })
        
        print(f"✅ Sentiment Analysis - Test Accuracy: {test_accuracy:.4f}")
        print(f"📊 Sentiment Distribution: {sentiment_distribution}")
        print()
    
    def demand_forecasting(self):
        """Time series forecasting for restaurant demand"""
        print("📈 Performing Demand Forecasting Analysis...")
        
        if self.activities_df.empty:
            print("❌ No activity data available")
            return
        
        # Prepare time series data
        self.activities_df['timestamp'] = pd.to_datetime(self.activities_df['timestamp'])
        
        # Group by hour and count activities
        hourly_demand = self.activities_df.groupby(
            self.activities_df['timestamp'].dt.floor('H')
        ).size().reset_index(name='demand')
        
        # Create features for demand prediction
        hourly_demand['hour'] = hourly_demand['timestamp'].dt.hour
        hourly_demand['day_of_week'] = hourly_demand['timestamp'].dt.dayofweek
        hourly_demand['is_weekend'] = hourly_demand['day_of_week'].isin([5, 6]).astype(int)
        
        # Prepare features and target
        features = ['hour', 'day_of_week', 'is_weekend']
        X = hourly_demand[features].values
        y = hourly_demand['demand'].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train Gradient Boosting model
        gb_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        gb_model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = gb_model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        
        # Feature importance
        feature_importance = dict(zip(features, gb_model.feature_importances_))
        
        # Generate future predictions (next 24 hours)
        future_hours = []
        for hour in range(24):
            for day in range(7):
                future_hours.append([
                    hour,
                    day,
                    1 if day in [5, 6] else 0
                ])
        
        future_predictions = gb_model.predict(future_hours)
        
        # Save results
        self.save_ml_results('demand_forecasting', {
            'model_performance': {
                'rmse': float(rmse),
                'mse': float(mse)
            },
            'feature_importance': {k: float(v) for k, v in feature_importance.items()},
            'future_predictions': future_predictions.tolist(),
            'peak_hours': [int(i) for i in np.argsort(future_predictions)[-5:]],
            'model_type': 'Gradient Boosting Regressor'
        })
        
        print(f"✅ Demand Forecasting - RMSE: {rmse:.4f}")
        print(f"🔝 Peak demand hours: {[int(i) for i in np.argsort(future_predictions)[-5:]]}")
        print()
    
    def user_behavior_analysis(self):
        """Advanced user behavior analysis using machine learning"""
        print("👥 Performing User Behavior Analysis...")
        
        if self.activities_df.empty:
            print("❌ No activity data available")
            return
        
        # Aggregate user behavior features
        user_features = self.activities_df.groupby('userId').agg({
            'timestamp': 'count',  # Total activities
            'type': lambda x: x.mode().iloc[0] if not x.empty else 'unknown',  # Most common activity
        }).rename(columns={'timestamp': 'total_activities'})
        
        # Add time-based features
        self.activities_df['hour'] = pd.to_datetime(self.activities_df['timestamp']).dt.hour
        user_time_features = self.activities_df.groupby('userId').agg({
            'hour': ['mean', 'std']
        })
        user_time_features.columns = ['avg_activity_hour', 'activity_hour_std']
        
        # Combine features
        user_features = user_features.join(user_time_features)
        user_features = user_features.fillna(0)
        
        # Encode categorical features
        activity_types = user_features['type'].unique()
        for activity_type in activity_types:
            user_features[f'is_{activity_type}'] = (user_features['type'] == activity_type).astype(int)
        
        # Prepare features for clustering
        clustering_features = user_features[['total_activities', 'avg_activity_hour', 'activity_hour_std']].values
        clustering_features_scaled = self.scaler.fit_transform(clustering_features)
        
        # Perform user segmentation
        kmeans = KMeans(n_clusters=4, random_state=42)
        user_segments = kmeans.fit_predict(clustering_features_scaled)
        
        # Analyze segments
        segment_analysis = {}
        for segment in range(4):
            segment_mask = user_segments == segment
            segment_data = user_features[segment_mask]
            
            segment_analysis[f'segment_{segment}'] = {
                'size': int(segment_mask.sum()),
                'avg_total_activities': float(segment_data['total_activities'].mean()),
                'avg_activity_hour': float(segment_data['avg_activity_hour'].mean()),
                'most_common_activity': segment_data['type'].mode().iloc[0] if not segment_data.empty else 'unknown',
                'characteristics': self.get_segment_characteristics(segment_data)
            }
        
        # Save results
        self.save_ml_results('user_behavior_analysis', {
            'total_users_analyzed': len(user_features),
            'user_segments': segment_analysis,
            'clustering_algorithm': 'K-Means',
            'n_segments': 4
        })
        
        print(f"✅ Analyzed {len(user_features)} users")
        print(f"📊 Identified 4 user segments")
        print()
    
    def get_segment_characteristics(self, segment_data):
        """Generate characteristics for user segments"""
        characteristics = []
        
        avg_activities = segment_data['total_activities'].mean()
        avg_hour = segment_data['avg_activity_hour'].mean()
        
        if avg_activities > 50:
            characteristics.append("High Activity Users")
        elif avg_activities > 20:
            characteristics.append("Moderate Activity Users")
        else:
            characteristics.append("Low Activity Users")
        
        if 6 <= avg_hour <= 10:
            characteristics.append("Morning Users")
        elif 11 <= avg_hour <= 14:
            characteristics.append("Lunch Time Users")
        elif 18 <= avg_hour <= 22:
            characteristics.append("Evening Users")
        else:
            characteristics.append("Late Night Users")
        
        return characteristics
    
    def save_ml_results(self, analysis_type, results):
        """Save ML analysis results to MongoDB"""
        result_doc = {
            'analysis_type': analysis_type,
            'timestamp': pd.Timestamp.now(),
            'results': results
        }
        
        self.db.ml_analytics_results.insert_one(result_doc)
        print(f"💾 Saved {analysis_type} results to database")
    
    def generate_comprehensive_report(self):
        """Generate a comprehensive ML analytics report"""
        print("📋 Generating Comprehensive ML Analytics Report...")
        
        # Get all ML results
        results = list(self.db.ml_analytics_results.find().sort('timestamp', -1))
        
        report = {
            'report_timestamp': pd.Timestamp.now().isoformat(),
            'total_analyses_performed': len(results),
            'analyses_summary': {}
        }
        
        for result in results:
            analysis_type = result['analysis_type']
            if analysis_type not in report['analyses_summary']:
                report['analyses_summary'][analysis_type] = {
                    'count': 0,
                    'latest_result': None
                }
            
            report['analyses_summary'][analysis_type]['count'] += 1
            if report['analyses_summary'][analysis_type]['latest_result'] is None:
                report['analyses_summary'][analysis_type]['latest_result'] = result['results']
        
        # Save comprehensive report
        self.db.ml_comprehensive_reports.insert_one(report)
        
        print("✅ Comprehensive report generated and saved")
        print(f"📊 Total analyses: {len(results)}")
        print(f"🔍 Analysis types: {list(report['analyses_summary'].keys())}")
        print()
    
    def run_all_analyses(self):
        """Run all ML analyses"""
        print("🚀 Starting Comprehensive ML Analysis Pipeline...")
        print("=" * 60)
        
        # Load data
        self.load_data()
        
        # Run all analyses
        self.recipe_recommendation_deep_learning()
        self.restaurant_clustering_analysis()
        self.sentiment_analysis_deep_learning()
        self.demand_forecasting()
        self.user_behavior_analysis()
        
        # Generate comprehensive report
        self.generate_comprehensive_report()
        
        print("🎉 All ML analyses completed successfully!")
        print("=" * 60)

if __name__ == "__main__":
    # Initialize and run ML analytics
    ml_analytics = LatePlateMLAnalytics()
    ml_analytics.run_all_analyses()
