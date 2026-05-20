/* eslint-disable */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Heart } from 'lucide-react';
import Section from '@/components/common/Section';
import Heading from '@/components/common/Heading';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { formatShortDate } from '@/utils/formatting';

const categoryColors = {
  'Anxiety': 'primary',
  'About Therapy': 'neutral',
  'Mindfulness': 'success',
  'Burnout': 'warning',
  'Relationships': 'coral',
};

const cardGradients = [
  'from-coral-100 to-coral-50',
  'from-cream-200 to-cream-50',
  'from-coral-50 to-cream-100',
  'from-coral-50/60 to-cream-50',
  'from-coral-100/60 to-cream-100',
  'from-cream-100 to-coral-50',
];

function BlogCard({ post, index }) {
  const gradient = cardGradients[index % cardGradients.length];
  const badgeVariant = categoryColors[post.category] || 'neutral';
  const isFeatured = post.featured && index === 0;

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group flex flex-col rounded-[1.5rem] bg-white border border-border-light shadow-level-1 overflow-hidden hover:shadow-level-3 hover:-translate-y-1.5 hover:border-coral-200 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral`}
    >
      <motion.article variants={staggerItem} className="flex flex-col flex-1">
        {/* Image area */}
        <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden shrink-0`}>
          <Heart className="w-12 h-12 text-coral/20 group-hover:scale-110 transition-transform duration-500" aria-hidden="true" />
          <div className="absolute inset-0 bg-coral/0 group-hover:bg-coral/5 transition-colors duration-300" />
          <div className="absolute top-4 left-4">
            <Badge variant={badgeVariant}>{post.category}</Badge>
          </div>
          {isFeatured && (
            <div className="absolute top-4 right-4">
              <span className="text-label font-bold px-3 py-1 rounded-full bg-coral text-white shadow-coral">Featured</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 text-label text-text-gray mb-3">
            <span>{formatShortDate(post.date)}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
          </div>
          <h3 className="font-body font-bold text-h4 text-text-dark mb-2 leading-snug group-hover:text-coral transition-colors duration-300 flex-1">
            {post.title}
          </h3>
          <p className="text-body-sm text-text-gray leading-relaxed mb-5 line-clamp-3">{post.excerpt}</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-body-sm font-medium text-text-dark">{post.author}</span>
            <span className="flex items-center gap-1 text-body-sm font-semibold text-coral opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              View Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

function BlogSection() {
  const { posts: blogPosts } = useBlogPosts({ limit: 6 });
  const featured = blogPosts.slice(0, 3);

  return (
    <Section id="blog" bg="white">
      <Heading
        align="center"
        subtitle="Practical insights on mental health, therapy, and everyday well-being — written by Charushri."
      >
        Resources &amp; Blog
      </Heading>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={staggerContainer(0.07)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {blogPosts.slice(0, 6).map((post, i) => (
          <BlogCard key={post.id} post={post} index={i} />
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="secondary" icon={ArrowRight} iconPosition="right">
          View All Articles
        </Button>
      </motion.div>
    </Section>
  );
}

export default BlogSection;
