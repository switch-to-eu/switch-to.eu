import React from "react";

interface TestimonialItem {
  quote: string;
  authorName: string;
  authorCompany?: string;
}

interface TestimonialsSectionProps {
  testimonials?: TestimonialItem[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
}) => {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      {/* The heading for this section (e.g., "Testimonials") should be rendered by the parent component. */}
      <div className="space-y-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 mb-4">
              <p className="text-lg">"{testimonial.quote}"</p>
            </blockquote>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {testimonial.authorName}
              </p>
              {testimonial.authorCompany && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {testimonial.authorCompany}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
