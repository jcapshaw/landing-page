'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarIcon } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export default function GoogleReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        // TODO: Replace with actual API call to fetch Google reviews
        // For now, we'll use mock data
        const mockReviews: Review[] = [
          {
            id: '1',
            author: 'John Smith',
            rating: 5,
            text: 'Great service! The staff was very helpful and I found exactly what I was looking for.',
            date: '2025-04-10',
          },
          {
            id: '2',
            author: 'Sarah Johnson',
            rating: 4,
            text: 'Good selection of vehicles. The salesperson was knowledgeable and not pushy.',
            date: '2025-04-08',
          },
          {
            id: '3',
            author: 'Michael Brown',
            rating: 5,
            text: 'Excellent experience from start to finish. Would definitely recommend to friends and family.',
            date: '2025-04-05',
          },
          {
            id: '4',
            author: 'Emily Davis',
            rating: 3,
            text: 'Decent selection but prices were a bit higher than expected. Staff was friendly though.',
            date: '2025-04-03',
          },
          {
            id: '5',
            author: 'Robert Wilson',
            rating: 5,
            text: "I have purchased multiple vehicles here and always had a great experience. Top notch service!",
            date: '2025-04-01',
          },
        ];
        
        setReviews(mockReviews);
        
        // Calculate average rating
        const total = mockReviews.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(parseFloat((total / mockReviews.length).toFixed(1)));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="dashboard-title">Google Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? null : (
          <>
            <div className="flex items-center mb-6">
              <div className="flex mr-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="dashboard-title">{averageRating}</span>
              <span className="dashboard-subtitle ml-2">out of 5</span>
            </div>
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="dashboard-title">{review.author}</div>
                    <div className="dashboard-subtitle">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex mb-2">{renderStars(review.rating)}</div>
                  <p className="dashboard-subtitle">{review.text}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-800 dashboard-subtitle font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Link to all reviews or Google Business page
                  alert('This would link to all Google reviews');
                }}
              >
                View all reviews
              </a>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}