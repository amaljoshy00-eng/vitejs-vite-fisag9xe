import { supabase } from './supabase';

export interface Review {
  id: string;
  reviewer_name: string;
  company_name: string | null;
  job_title: string | null;
  profile_photo_url: string | null;
  rating: number;
  review_text: string;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  created_at: string;
}

export interface NewReview {
  reviewer_name: string;
  company_name?: string;
  job_title?: string;
  profile_photo_url?: string;
  rating: number;
  review_text: string;
}

// Get publicly approved reviews
export async function getApprovedReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []) as Review[];
}

// Submit a new review for admin approval
export async function submitReview(review: NewReview): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    reviewer_name: review.reviewer_name.trim(),
    company_name: review.company_name?.trim() || null,
    job_title: review.job_title?.trim() || null,
    profile_photo_url: review.profile_photo_url?.trim() || null,
    rating: review.rating,
    review_text: review.review_text.trim(),
    status: 'pending',
  });

  if (error) throw error;
}

// Get all reviews (admin only)
export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []) as Review[];
}

// Update review status (admin only)
export async function updateReviewStatus(
  id: string,
  status: Review['status']
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

// Delete a review (admin only)
export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', id);

  if (error) throw error;
}
