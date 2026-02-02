export interface Pet {
  id: string
  name: string
  species: string
  breed: string
  age: string
  price: number
  image: string
  description: string
  inStock: boolean
  isVisible: boolean
  featured: boolean
}

export const initialPets: Pet[] = [
  {
    id: "1",
    name: "Goldie",
    species: "Fish",
    breed: "Goldfish",
    age: "6 months",
    price: 15,
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&h=300&fit=crop",
    description: "A beautiful golden companion for your aquarium. Goldie is healthy and active.",
    inStock: true,
    isVisible: true,
    featured: true,
  },
  {
    id: "2",
    name: "Max",
    species: "Dog",
    breed: "Golden Retriever",
    age: "2 years",
    price: 800,
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
    description: "Friendly and loyal Golden Retriever. Great with kids and other pets.",
    inStock: true,
    isVisible: true,
    featured: true,
  },
  {
    id: "3",
    name: "Whiskers",
    species: "Cat",
    breed: "Persian",
    age: "1 year",
    price: 450,
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop",
    description: "Elegant Persian cat with a calm and affectionate personality.",
    inStock: true,
    isVisible: true,
    featured: true,
  },
  {
    id: "4",
    name: "Tweety",
    species: "Bird",
    breed: "Canary",
    age: "8 months",
    price: 75,
    image: "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=400&h=300&fit=crop",
    description: "Bright yellow canary with a beautiful singing voice.",
    inStock: true,
    isVisible: true,
    featured: false,
  },
  {
    id: "5",
    name: "Hoppy",
    species: "Rabbit",
    breed: "Holland Lop",
    age: "4 months",
    price: 120,
    image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop",
    description: "Adorable Holland Lop bunny with floppy ears and a sweet temperament.",
    inStock: false,
    isVisible: true,
    featured: true,
  },
  {
    id: "6",
    name: "Nemo",
    species: "Fish",
    breed: "Clownfish",
    age: "1 year",
    price: 35,
    image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&h=300&fit=crop",
    description: "Vibrant clownfish perfect for saltwater aquariums.",
    inStock: true,
    isVisible: true,
    featured: false,
  },
  {
    id: "7",
    name: "Shell",
    species: "Turtle",
    breed: "Red-Eared Slider",
    age: "3 years",
    price: 85,
    image: "https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=400&h=300&fit=crop",
    description: "Friendly turtle that loves to swim and bask in the sun.",
    inStock: true,
    isVisible: true,
    featured: false,
  },
  {
    id: "8",
    name: "Coco",
    species: "Parrot",
    breed: "Cockatiel",
    age: "2 years",
    price: 200,
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop",
    description: "Talkative and social cockatiel that loves interaction.",
    inStock: true,
    isVisible: true,
    featured: true,
  },
]
