import pymongo
import json
from datetime import datetime

# MongoDB connection
client = pymongo.MongoClient("mongodb+srv://sanjaywick:Sanjay1010@cluster0.c12pas1.mongodb.net/")
db = client["lateplate_finder"]

# Sample recipes data matching your MongoDB structure
recipes = [
    {
        "RecipeName": "Gram and Potato Dry Vegetable Recipe",
        "Ingredients": [
            "1 cup Kabuli Chana (White Chickpeas) - boiled",
            "3 Potatoes (Aloo) - boiled",
            "1 Onion - finely chopped",
            "1 Tomato - finely chopped",
            "1 Green Chilli - finely chopped",
            "1 tablespoon Ginger Garlic Paste",
            "1 teaspoon Red Chilli powder",
            "1/2 teaspoon Turmeric powder (Haldi)",
            "2 teaspoons Coriander Powder (Dhania)",
            "1 teaspoon Garam masala powder",
            "1 teaspoon Amchur (Dry Mango Powder)",
            "1 teaspoon Cumin seeds (Jeera)",
            "4 sprig Coriander (Dhania) Leaves - finely chopped for garnish",
            "1 inch Ginger - cut in juliennes (long thin strips) for garnish",
            "1 tablespoon Sunflower Oil",
            "Salt - for taste"
        ],
        "PrepTimeInMins": 10,
        "CookTimeInMins": 20,
        "TotalTimeInMins": 30,
        "Servings": 3,
        "Cuisine": "North Indian Recipes",
        "Course": "Lunch",
        "Diet": "High Protein Vegetarian",
        "Instructions": "To begin making Chana Aur Aloo Ki Sookhi Sabzi, soak the chickpea or chana overnight in enough water. The next day, pressure cook the soaked chana in a pressure cooker with enough water and salt for about 3 to 4 whistles. Turn off the heat and allow the pressure to release naturally.",
        "URL": "http://www.archanaskitchen.com/chana-aur-aloo-ki-sookhi-sabzi-recipe",
        "createdAt": datetime.now(),
        "rating": 4.5,
        "reviews": 89
    },
    {
        "RecipeName": "Aloo Gobi Masala Recipe",
        "Ingredients": [
            "2 cups Cauliflower (gobi) - cut into florets",
            "2 Potatoes (Aloo) - cubed",
            "1 Onion - finely chopped",
            "2 Tomatoes - finely chopped",
            "1 tablespoon Ginger Garlic Paste",
            "1 teaspoon Cumin seeds (Jeera)",
            "1 teaspoon Coriander seeds - crushed",
            "1/2 teaspoon Turmeric powder (Haldi)",
            "1 teaspoon Red Chilli powder",
            "1 teaspoon Garam masala powder",
            "2 tablespoons Oil",
            "Salt - to taste",
            "Fresh coriander leaves - for garnish"
        ],
        "PrepTimeInMins": 15,
        "CookTimeInMins": 25,
        "TotalTimeInMins": 40,
        "Servings": 4,
        "Cuisine": "North Indian Recipes",
        "Course": "Lunch",
        "Diet": "Vegetarian",
        "Instructions": "Heat oil in a heavy bottomed pan. Add cumin seeds and let them splutter. Add onions and sauté until golden brown. Add ginger garlic paste and cook for a minute.",
        "URL": "http://www.archanaskitchen.com/aloo-gobi-masala-recipe",
        "createdAt": datetime.now(),
        "rating": 4.3,
        "reviews": 156
    },
    {
        "RecipeName": "Chicken Biryani Recipe",
        "Ingredients": [
            "500 grams Chicken - cut into pieces",
            "2 cups Basmati rice",
            "1 cup Yogurt (Dahi / Curd)",
            "2 Onions - thinly sliced",
            "1 tablespoon Ginger Garlic Paste",
            "1 teaspoon Red Chilli powder",
            "1/2 teaspoon Turmeric powder (Haldi)",
            "1 teaspoon Garam masala powder",
            "4 Green Cardamom (Elaichi) Pods/Seeds",
            "2 Bay leaves (tej patta)",
            "1 inch Cinnamon Stick (Dalchini)",
            "4 Cloves (Laung)",
            "1/4 cup Mint Leaves (Pudina)",
            "1/4 cup Coriander (Dhania) Leaves",
            "3 tablespoons Ghee",
            "Salt - to taste"
        ],
        "PrepTimeInMins": 30,
        "CookTimeInMins": 45,
        "TotalTimeInMins": 75,
        "Servings": 4,
        "Cuisine": "Hyderabadi",
        "Course": "Lunch",
        "Diet": "Non Vegetarian",
        "Instructions": "Marinate chicken with yogurt, ginger garlic paste, red chilli powder, turmeric and salt. Keep aside for 30 minutes. Soak basmati rice for 30 minutes.",
        "URL": "http://www.archanaskitchen.com/chicken-biryani-recipe",
        "createdAt": datetime.now(),
        "rating": 4.8,
        "reviews": 234
    },
    {
        "RecipeName": "Palak Paneer Recipe",
        "Ingredients": [
            "200 grams Paneer - cubed",
            "500 grams Spinach Leaves (Palak)",
            "1 Onion - finely chopped",
            "2 Tomatoes - finely chopped",
            "1 tablespoon Ginger Garlic Paste",
            "2 Green Chillies",
            "1/2 teaspoon Cumin seeds (Jeera)",
            "1/2 teaspoon Turmeric powder (Haldi)",
            "1 teaspoon Red Chilli powder",
            "1 teaspoon Garam masala powder",
            "1/4 cup Fresh cream",
            "2 tablespoons Oil",
            "Salt - to taste"
        ],
        "PrepTimeInMins": 15,
        "CookTimeInMins": 20,
        "TotalTimeInMins": 35,
        "Servings": 3,
        "Cuisine": "North Indian Recipes",
        "Course": "Lunch",
        "Diet": "Vegetarian",
        "Instructions": "Blanch spinach leaves in boiling water for 2-3 minutes. Drain and blend to smooth paste. Heat oil in pan, add cumin seeds.",
        "URL": "http://www.archanaskitchen.com/palak-paneer-recipe",
        "createdAt": datetime.now(),
        "rating": 4.6,
        "reviews": 178
    },
    {
        "RecipeName": "Rajma Masala Recipe",
        "Ingredients": [
            "1 cup Rajma (Large Kidney Beans) - soaked overnight",
            "2 Onions - finely chopped",
            "3 Tomatoes - finely chopped",
            "1 tablespoon Ginger Garlic Paste",
            "2 Green Chillies - slit",
            "1 teaspoon Cumin seeds (Jeera)",
            "1 Bay leaf (tej patta)",
            "1 teaspoon Red Chilli powder",
            "1/2 teaspoon Turmeric powder (Haldi)",
            "1 teaspoon Coriander Powder (Dhania)",
            "1 teaspoon Garam masala powder",
            "2 tablespoons Oil",
            "Salt - to taste",
            "Fresh coriander leaves - for garnish"
        ],
        "PrepTimeInMins": 20,
        "CookTimeInMins": 40,
        "TotalTimeInMins": 60,
        "Servings": 4,
        "Cuisine": "North Indian Recipes",
        "Course": "Lunch",
        "Diet": "High Protein Vegetarian",
        "Instructions": "Pressure cook soaked rajma with salt and water for 6-7 whistles. Heat oil in pan, add cumin seeds and bay leaf.",
        "URL": "http://www.archanaskitchen.com/rajma-masala-recipe",
        "createdAt": datetime.now(),
        "rating": 4.4,
        "reviews": 145
    }
]

# Sample user feedback data
feedback = [
    {
        "userId": "user1",
        "type": "recipe",
        "itemId": "recipe1",
        "rating": 5,
        "comment": "Amazing recipe! The chana and potatoes were perfectly cooked.",
        "sentiment": "positive",
        "timestamp": datetime.now()
    },
    {
        "userId": "user2",
        "type": "recipe",
        "itemId": "recipe2",
        "rating": 4,
        "comment": "Good recipe but needed more spices for my taste.",
        "sentiment": "positive",
        "timestamp": datetime.now()
    },
    {
        "userId": "user3",
        "type": "recipe",
        "itemId": "recipe3",
        "rating": 5,
        "comment": "Best biryani recipe ever! Chicken was tender and rice was perfect.",
        "sentiment": "positive",
        "timestamp": datetime.now()
    }
]

# Sample analytics data
analytics = {
    "searchPatterns": [
        {"hour": 18, "restaurants": 45, "recipes": 23, "grocery": 12},
        {"hour": 20, "restaurants": 78, "recipes": 34, "grocery": 18},
        {"hour": 22, "restaurants": 156, "recipes": 67, "grocery": 34},
        {"hour": 0, "restaurants": 234, "recipes": 89, "grocery": 45},
        {"hour": 2, "restaurants": 189, "recipes": 78, "grocery": 23},
        {"hour": 4, "restaurants": 67, "recipes": 34, "grocery": 12}
    ],
    "cuisinePopularity": [
        {"cuisine": "North Indian Recipes", "count": 3245, "percentage": 35},
        {"cuisine": "South Indian Recipes", "count": 2876, "percentage": 31},
        {"cuisine": "Chinese", "count": 2134, "percentage": 23},
        {"cuisine": "Continental", "count": 1987, "percentage": 21},
        {"cuisine": "Hyderabadi", "count": 1432, "percentage": 15}
    ],
    "lastUpdated": datetime.now()
}

def seed_database():
    try:
        # Clear existing data
        db.recipes.delete_many({})
        db.feedback.delete_many({})
        db.analytics.delete_many({})
        
        # Insert sample data
        db.recipes.insert_many(recipes)
        db.feedback.insert_many(feedback)
        db.analytics.insert_one(analytics)
        
        print(f"Successfully seeded database with:")
        print(f"- {len(recipes)} recipes")
        print(f"- {len(feedback)} feedback entries")
        print(f"- Analytics data")
        
        # Create indexes for better performance
        db.recipes.create_index([("Ingredients", "text"), ("RecipeName", "text")])
        db.feedback.create_index("timestamp")
        
        print("Database indexes created successfully")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_database()
