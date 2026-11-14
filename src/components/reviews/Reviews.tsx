import { useEffect, useState, type FormEvent } from 'react';
import {
  getApprovedReviews,
  submitReview,
  type Review,
} from '../../lib/reviews';
import './Reviews.css';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    reviewer_name: '',
    company_name: '',
    job_title: '',
    profile_photo_url: '',
    rating: 5,
    review_text: '',
  });

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const data = await getApprovedReviews();
      setReviews(data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (form.rating < 1 || form.rating > 5) {
      setError('Please select a rating.');
      return;
    }

    setSubmitting(true);

    try {
      await submitReview(form);

      setMessage(
        'Thank you! Your review has been submitted and is awaiting approval.'
      );

      setForm({
        reviewer_name: '',
        company_name: '',
        job_title: '',
        profile_photo_url: '',
        rating: 5,
        review_text: '',
      });
    } catch (err) {
      console.error('Review submission error:', err);
      setError('Unable to submit your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="reviews-section" id="reviews">
      <div className="reviews-container">
        <div className="reviews-heading">
          <span className="reviews-eyebrow">CLIENT FEEDBACK</span>
          <h2>
            Words That <span>Inspire</span>
          </h2>
          <p>
            Your feedback means a lot. Share your experience working with me.
          </p>
        </div>

        <div className="reviews-display">
          {loading ? (
            <p className="reviews-status">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="reviews-status">
              No reviews yet. Be the first to share your experience!
            </p>
          ) : (
            <div className="reviews-grid">
              {reviews.map((review) => (
                <article className="review-card" key={review.id}>
                  <div className="review-stars">
                    {'★'.repeat(review.rating)}
                    <span>{'☆'.repeat(5 - review.rating)}</span>
                  </div>

                  <p className="review-text">“{review.review_text}”</p>

                  <div className="review-person">
                    {review.profile_photo_url ? (
                      <img
                        src={review.profile_photo_url}
                        alt={review.reviewer_name}
                      />
                    ) : (
                      <div className="review-avatar">
                        {review.reviewer_name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h4>{review.reviewer_name}</h4>
                      <p>
                        {[review.job_title, review.company_name]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="review-form-card">
          <h3>Share Your Experience</h3>
          <p className="review-form-description">
            I'd love to hear what you think about my work.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="review-form-row">
              <label>
                Full Name *
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.reviewer_name}
                  onChange={(e) =>
                    setForm({ ...form, reviewer_name: e.target.value })
                  }
                  placeholder="Your full name"
                />
              </label>

              <label>
                Company Name
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) =>
                    setForm({ ...form, company_name: e.target.value })
                  }
                  placeholder="Your company"
                />
              </label>
            </div>

            <div className="review-form-row">
              <label>
                Designation / Job Title
                <input
                  type="text"
                  value={form.job_title}
                  onChange={(e) =>
                    setForm({ ...form, job_title: e.target.value })
                  }
                  placeholder="Your designation"
                />
              </label>

              <label>
                Profile Photo URL (Optional)
                <input
                  type="url"
                  value={form.profile_photo_url}
                  onChange={(e) =>
                    setForm({ ...form, profile_photo_url: e.target.value })
                  }
                  placeholder="https://example.com/photo.jpg"
                />
              </label>
            </div>

            <div className="review-rating-field">
              <span>Your Rating *</span>
              <div className="review-rating-select">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={star <= form.rating ? 'selected' : ''}
                    onClick={() => setForm({ ...form, rating: star })}
                    aria-label={`${star} star rating`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <label className="review-message-field">
              Your Review *
              <textarea
                required
                minLength={10}
                maxLength={2000}
                rows={5}
                value={form.review_text}
                onChange={(e) =>
                  setForm({ ...form, review_text: e.target.value })
                }
                placeholder="Tell me about your experience..."
              />
            </label>

            {message && <p className="review-success">{message}</p>}
            {error && <p className="review-error">{error}</p>}

            <button
              type="submit"
              className="review-submit-button"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review →'}
            </button>

            <p className="review-approval-note">
              Reviews are published after admin approval.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
