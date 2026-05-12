// In-memory database for gyms and reviews
let gyms = [
  {
    id: '1',
    name: 'FitnessFirst Downtown',
    location: 'stockholm',
    rating: 4.5,
    reviews: []
  },
  {
    id: '2',
    name: 'CrossFit Elite',
    location: 'stockholm',
    rating: 4.8,
    reviews: []
  },
  {
    id: '3',
    name: 'Yoga Zen',
    location: 'stockholm',
    rating: 4.2,
    reviews: []
  }
];

let reviewIdCounter = 1;

const db = {
  // Gym operations
  getAllGyms: () => gyms,
  
  getGymById: (id) => gyms.find(gym => gym.id === id),
  
  createGym: (gymData) => {
    const newGym = {
      id: String(gyms.length + 1),
      ...gymData,
      reviews: []
    };
    gyms.push(newGym);
    return newGym;
  },

  // Review operations
  addReview: (gymId, reviewData) => {
    const gym = gyms.find(g => g.id === gymId);
    if (!gym) return null;
    
    const review = {
      id: String(reviewIdCounter++),
      gymId,
      ...reviewData,
      createdAt: new Date().toISOString()
    };
    gym.reviews.push(review);
    return review;
  },

  // Reset (for testing)
  reset: () => {
    gyms = [
      {
        id: '1',
        name: 'FitnessFirst Downtown',
        location: 'stockholm',
        rating: 4.5,
        reviews: []
      },
      {
        id: '2',
        name: 'CrossFit Elite',
        location: 'stockholm',
        rating: 4.8,
        reviews: []
      },
      {
        id: '3',
        name: 'Yoga Zen',
        location: 'stockholm',
        rating: 4.2,
        reviews: []
      }
    ];
    reviewIdCounter = 1;
  }
};

module.exports = db;
