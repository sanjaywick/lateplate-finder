#!/usr/bin/env node

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = "mongodb+srv://sanjaywick:Sanjay1010@cluster0.c12pas1.mongodb.net/";
const DB_NAME = "lateplate_finder";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");
  console.log("=" .repeat(50));

  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    const db = client.db(DB_NAME);

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      db.collection('users').deleteMany({}),
      db.collection('recipes').deleteMany({}),
      db.collection('restaurants').deleteMany({}),
      db.collection('search_logs').deleteMany({}),
      db.collection('feedback').deleteMany({}),
      db.collection('location_logs').deleteMany({}),
      db.collection('ml_analytics_results').deleteMany({}),
      db.collection('ml_comprehensive_reports').deleteMany({})
    ]);

    // Seed Users
    console.log("👥 Seeding users...");
    const users = [
      {
        _id: new ObjectId(),
        name: "Admin User",
        email: "admin@example.com",
        password: "$2b$10$rQZ9QmjlZKZvKJ9QmjlZKO9QmjlZKZvKJ9QmjlZKZvKJ9QmjlZKZv", // password123
        role: "admin",
        favoritesCuisines: ["Italian", "Mexican", "Chinese"],
        dietaryPreference: "none",
        allergies: [],
        hasDiabetes: false,
        profileComplete: true,
        createdAt: new Date(),
        lastActivity: new Date()
      },
      {
        _id: new ObjectId(),
        name: "John Doe",
        email: "john@example.com",
        password: "$2b$10$rQZ9QmjlZKZvKJ9QmjlZKO9QmjlZKZvKJ9QmjlZKZvKJ9QmjlZKZv", // password123
        role: "user",
        favoritesCuisines: ["Italian", "American"],
        dietaryPreference: "vegetarian",
        allergies: ["nuts"],
        hasDiabetes: false,
        profileComplete: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        lastActivity: new Date()
      },
      {
        _id: new ObjectId(),
        name: "Jane Smith",
        email: "jane@example.com",
        password: "$2b$10$rQZ9QmjlZKZvKJ9QmjlZKO9QmjlZKZvKJ9QmjlZKZvKJ9QmjlZKZv", // password123
        role: "user",
        favoritesCuisines: ["Asian", "Mediterranean"],
        dietaryPreference: "vegan",
        allergies: ["dairy", "gluten"],
        hasDiabetes: true,
        profileComplete: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        lastActivity: new Date()
      }
    ];

    await db.collection('users').insertMany(users);
    console.log(`✅ Inserted ${users.length} users`);

    // Seed Recipes
    console.log("🍳 Seeding recipes...");
    const recipes = [
      {
        _id: new ObjectId(),
        RecipeName: "Midnight Pasta Carbonara",
        Ingredients: [
          "400g spaghetti",
          "200g pancetta or bacon",
          "4 large eggs",
          "100g Parmesan cheese",
          "2 cloves garlic",
          "Black pepper",
          "Salt",
          "Olive oil"
        ],
        PrepTimeInMins: 10,
        CookTimeInMins: 20,
        TotalTimeInMins: 30,
        Servings: 4,
        Cuisine: "Italian",
        Course: "Dinner",
        Diet: "Non-Vegetarian",
        Instructions: "Cook pasta. Fry pancetta. Mix eggs and cheese. Combine all with pasta off heat.",
        URL: "http://example.com/carbonara",
        rating: 4.8,
        reviews: 245,
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        RecipeName: "Quick Veggie Stir Fry",
        Ingredients: [
          "2 cups mixed vegetables",
          "2 tbsp soy sauce",
          "1 tbsp sesame oil",
          "2 cloves garlic",
          "1 inch ginger",
          "1 tbsp cornstarch",
          "2 tbsp vegetable oil",
          "Green onions"
        ],
        PrepTimeInMins: 15,
        CookTimeInMins: 10,
        TotalTimeInMins: 25,
        Servings: 2,
        Cuisine: "Asian",
        Course: "Dinner",
        Diet: "Vegetarian",
        Instructions: "Heat oil, add garlic and ginger, add vegetables, stir fry with sauce.",
        URL: "http://example.com/stir-fry",
        rating: 4.5,
        reviews: 189,
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        RecipeName: "Late Night Grilled Cheese",
        Ingredients: [
          "4 slices bread",
          "4 slices cheese",
          "2 tbsp butter",
          "1 tomato (optional)",
          "Salt",
          "Pepper"
        ],
        PrepTimeInMins: 5,
        CookTimeInMins: 8,
        TotalTimeInMins: 13,
        Servings: 2,
        Cuisine: "American",
        Course: "Snack",
        Diet: "Vegetarian",
        Instructions: "Butter bread, add cheese, grill until golden and cheese melts.",
        URL: "http://example.com/grilled-cheese",
        rating: 4.2,
        reviews: 156,
        createdAt: new Date()
      }
    ];

    // Generate more recipes
    const cuisines = ["Italian", "Mexican", "Chinese", "Indian", "Thai", "American", "Mediterranean", "Japanese"];
    const diets = ["Vegetarian", "Non-Vegetarian", "Vegan", "Gluten-Free"];
    const courses = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

    for (let i = 0; i < 50; i++) {
      recipes.push({
        _id: new ObjectId(),
        RecipeName: `Recipe ${i + 4}`,
        Ingredients: [
          "Main ingredient",
          "Secondary ingredient",
          "Spices",
          "Oil",
          "Salt"
        ],
        PrepTimeInMins: Math.floor(Math.random() * 30) + 5,
        CookTimeInMins: Math.floor(Math.random() * 60) + 10,
        TotalTimeInMins: Math.floor(Math.random() * 90) + 15,
        Servings: Math.floor(Math.random() * 6) + 1,
        Cuisine: cuisines[Math.floor(Math.random() * cuisines.length)],
        Course: courses[Math.floor(Math.random() * courses.length)],
        Diet: diets[Math.floor(Math.random() * diets.length)],
        Instructions: "Detailed cooking instructions here.",
        URL: `http://example.com/recipe-${i + 4}`,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
        reviews: Math.floor(Math.random() * 500) + 10,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      });
    }

    await db.collection('recipes').insertMany(recipes);
    console.log(`✅ Inserted ${recipes.length} recipes`);

    // Seed Restaurants
    console.log("🍕 Seeding restaurants...");
    const restaurants = [
      {
        _id: new ObjectId(),
        name: "Tony's 24/7 Pizza",
        address: "123 Main St, New York, NY",
        latitude: 40.7128,
        longitude: -74.0060,
        cuisine: ["Italian", "Pizza"],
        rating: 4.5,
        priceLevel: 2,
        reviewCount: 234,
        isOpen24Hours: true,
        phone: "+1-555-0123",
        website: "https://tonys-pizza.com",
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: "Midnight Diner",
        address: "456 Broadway, New York, NY",
        latitude: 40.7589,
        longitude: -73.9851,
        cuisine: ["American", "Diner"],
        rating: 4.2,
        priceLevel: 1,
        reviewCount: 189,
        isOpen24Hours: true,
        phone: "+1-555-0124",
        website: "https://midnight-diner.com",
        createdAt: new Date()
      }
    ];

    await db.collection('restaurants').insertMany(restaurants);
    console.log(`✅ Inserted ${restaurants.length} restaurants`);

    // Seed Search Logs
    console.log("🔍 Seeding search logs...");
    const searchLogs = [];
    const searchTypes = ["restaurant", "recipe", "grocery"];
    
    for (let i = 0; i < 100; i++) {
      const userId = users[Math.floor(Math.random() * users.length)]._id;
      const type = searchTypes[Math.floor(Math.random() * searchTypes.length)];
      const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      searchLogs.push({
        _id: new ObjectId(),
        userId: userId.toString(),
        type,
        query: `${type} search query ${i + 1}`,
        location: "New York, NY",
        timestamp,
        results: Math.floor(Math.random() * 20) + 1,
        createdAt: timestamp
      });
    }

    await db.collection('search_logs').insertMany(searchLogs);
    console.log(`✅ Inserted ${searchLogs.length} search logs`);

    // Seed Feedback
    console.log("💬 Seeding feedback...");
    const feedback = [];
    const comments = [
      "Great recipe, easy to follow!",
      "Delicious and quick to make",
      "Perfect for late night cravings",
      "Could use more seasoning",
      "Amazing flavors, will make again",
      "Too spicy for my taste",
      "Excellent restaurant, great service",
      "Food was cold when delivered",
      "Best pizza in town!",
      "Overpriced but good quality"
    ];

    for (let i = 0; i < 50; i++) {
      const userId = users[Math.floor(Math.random() * users.length)]._id;
      const rating = Math.floor(Math.random() * 5) + 1;
      const comment = comments[Math.floor(Math.random() * comments.length)];
      
      feedback.push({
        _id: new ObjectId(),
        userId: userId.toString(),
        type: Math.random() > 0.5 ? "recipe" : "restaurant",
        itemId: new ObjectId().toString(),
        rating,
        comment,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      });
    }

    await db.collection('feedback').insertMany(feedback);
    console.log(`✅ Inserted ${feedback.length} feedback entries`);

    // Seed Location Logs
    console.log("📍 Seeding location logs...");
    const locationLogs = [];
    
    for (let i = 0; i < 75; i++) {
      const userId = users[Math.floor(Math.random() * users.length)]._id;
      
      locationLogs.push({
        _id: new ObjectId(),
        userId: userId.toString(),
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
        address: `${Math.floor(Math.random() * 999) + 1} Street Name, New York, NY`,
        source: Math.random() > 0.5 ? "geolocation" : "manual",
        accuracy: Math.floor(Math.random() * 100) + 10,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        userAgent: "Mozilla/5.0 (compatible; LatePlate/1.0)",
        createdAt: new Date()
      });
    }

    await db.collection('location_logs').insertMany(locationLogs);
    console.log(`✅ Inserted ${locationLogs.length} location logs`);

    // Create indexes for better performance
    console.log("🔧 Creating database indexes...");
    await Promise.all([
      db.collection('recipes').createIndex({ Ingredients: "text", RecipeName: "text", Cuisine: "text" }),
      db.collection('restaurants').createIndex({ name: "text", cuisine: 1 }),
      db.collection('restaurants').createIndex({ latitude: 1, longitude: 1 }),
      db.collection('search_logs').createIndex({ userId: 1, timestamp: -1 }),
      db.collection('feedback').createIndex({ userId: 1, timestamp: -1 }),
      db.collection('location_logs').createIndex({ userId: 1, timestamp: -1 }),
      db.collection('users').createIndex({ email: 1 }, { unique: true })
    ]);

    console.log("✅ Database indexes created");
    console.log();
    console.log("🎉 Database seeding completed successfully!");
    console.log("=" .repeat(50));
    console.log("📊 Summary:");
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🍳 Recipes: ${recipes.length}`);
    console.log(`   🍕 Restaurants: ${restaurants.length}`);
    console.log(`   🔍 Search Logs: ${searchLogs.length}`);
    console.log(`   💬 Feedback: ${feedback.length}`);
    console.log(`   📍 Location Logs: ${locationLogs.length}`);
    console.log();
    console.log("🔑 Test Accounts:");
    console.log("   Admin: admin@example.com / password123");
    console.log("   User: john@example.com / password123");
    console.log("   User: jane@example.com / password123");
    console.log();
    console.log("✅ Ready to run: node scripts/advanced-ml-analytics.js");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
