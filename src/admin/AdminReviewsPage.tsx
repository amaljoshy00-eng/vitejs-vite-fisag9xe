import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import {
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  type Review,
} from '../lib/reviews';
import './AdminReviewsPage.css';

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setMessage('Unable to load reviews.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: Review['status']) {
    setProcessingId(id);
    setMessage('');

    try {
      await updateReviewStatus(id, status);
      await loadReviews();
      setMessage(`Review ${status} successfully.`);
    } catch (error) {
      console.error('Error updating review:', error);
      setMessage('Unable to update review.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this review?'
    );

    if (!confirmed) return;

    setProcessingId(id);
    setMessage('');

    try {
      await deleteReview(id);
      await loadReviews();
      setMessage('Review deleted successfully.');
    } catch (error) {
      console.error('Error deleting review:', error);
      setMessage('Unable to delete review.');
    } finally {
      setProcessingId(null);
    }
  }

  const pendingCount = reviews.filter(
    (review) => review.status === 'pending'
  ).length;

  const approvedCount = reviews.filter(
    (review) => review.status === 'approved'
  ).length;

  const rejectedCount = reviews.filter(
    (review) => review.status === 'rejected'
  ).length;

  const filteredReviews =
    filter === 'all'
      ? reviews
      : reviews.filter((review) => review.status === filter);

  return (
    <AdminLayout activePage="reviews" title="Reviews Management">
      <div className="admin-reviews-page">
        {/* STATISTICS */}
        <div className="review-stats-grid">
          <div className="review-stat-card">
            <span>Total Reviews</span>
            <strong>{reviews.length}</strong>
          </div>

          <div className="review-stat-card pending">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>

          <div className="review-stat-card approved">
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>

          <div className="review-stat-card rejected">
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>

        {/* FILTERS */}
        <div className="admin-reviews-toolbar">
          <div>
            <h2>Visitor Reviews</h2>
            <p>Manage feedback submitted through your portfolio.</p>
          </div>

          <div className="review-filter-buttons">
            {['all', 'pending', 'approved', 'rejected', 'hidden'].map(
              (status) => (
                <button
                  key={status}
                  className={filter === status ? 'active' : ''}
                  onClick={() => setFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {message && <div className="admin-review-message">{message}</div>}

        {/* REVIEW LIST */}
        {loading ? (
          <p className="admin-reviews-loading">Loading reviews...</p>
        ) : filteredReviews.length === 0 ? (
          <div className="admin-reviews-empty">
            <span>★</span>
            <h3>No reviews found</h3>
            <p>There are no reviews in this category yet.</p>
          </div>
        ) : (
          <div className="admin-reviews-list">
            {filteredReviews.map((review) => (
              <article className="admin-review-card" key={review.id}>
                <div className="admin-review-top">
                  <div className="admin-review-person">
                    {review.profile_photo_url ? (
                      <img
                        src={review.profile_photo_url}
                        alt={review.reviewer_name}
                      />
                    ) : (
                      <div className="admin-review-avatar">
                        {review.reviewer_name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h3>{review.reviewer_name}</h3>
                      <p>
                        {[review.job_title, review.company_name]
                          .filter(Boolean)
                          .join(' · ') || 'No company details'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`admin-review-status status-${review.status}`}
                  >
                    {review.status}
                  </span>
                </div>

                <div className="admin-review-stars">
                  {'★'.repeat(review.rating)}
                  <span>{'☆'.repeat(5 - review.rating)}</span>
                </div>

                <p className="admin-review-text">{review.review_text}</p>

                <p className="admin-review-date">
                  Submitted: {new Date(review.created_at).toLocaleString()}
                </p>

                <div className="admin-review-actions">
                  {review.status !== 'approved' && (
                    <button
                      className="approve-review"
                      disabled={processingId === review.id}
                      onClick={() => handleStatusChange(review.id, 'approved')}
                    >
                      ✓ Approve
                    </button>
                  )}

                  {review.status !== 'rejected' && (
                    <button
                      className="reject-review"
                      disabled={processingId === review.id}
                      onClick={() => handleStatusChange(review.id, 'rejected')}
                    >
                      ✕ Reject
                    </button>
                  )}

                  {review.status !== 'hidden' && (
                    <button
                      className="hide-review"
                      disabled={processingId === review.id}
                      onClick={() => handleStatusChange(review.id, 'hidden')}
                    >
                      Hide
                    </button>
                  )}

                  <button
                    className="delete-review"
                    disabled={processingId === review.id}
                    onClick={() => handleDelete(review.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminReviewsPage;
