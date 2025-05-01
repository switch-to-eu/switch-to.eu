import { NextRequest, NextResponse } from 'next/server';

interface Expert {
  id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  image: string;
}

const experts: Expert[] = [
  {
    id: '1',
    name: 'John Doe',
    description: 'Expert in EU tech services',
    location: { lat: 52.52, lng: 13.405 },
    image: '/images/experts/john_doe.jpg',
  },
  {
    id: '2',
    name: 'Jane Smith',
    description: 'Specialist in EU data privacy',
    location: { lat: 48.8566, lng: 2.3522 },
    image: '/images/experts/jane_smith.jpg',
  },
  // Add more experts as needed
];

export async function fetchExperts() {
  return experts;
}

export async function GET(request: NextRequest) {
  return NextResponse.json(await fetchExperts());
}
