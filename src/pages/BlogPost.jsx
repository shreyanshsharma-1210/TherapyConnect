import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Calendar, Tag, Share2,
  Link2, BookOpen, ChevronUp, ArrowRight
} from 'lucide-react';

const Twitter = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" /></svg>;
const Linkedin = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" /></svg>;
import { blogPosts } from '@/data/blogData';
import { blogContent } from '@/data/blogContent';
import { useBlogPost, useBlogPosts } from '@/hooks/useBlogPosts';
import { formatDate } from '@/utils/formatting';
import SEO from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// Parse markdown into sections for ToC and rendering
function parseMarkdown(md = '') {
  const lines = md.split('\n');
  const sections = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { heading: line.replace(/^## /, ''), body: '' };
    } else if (current) {
      current.body += (current.body ? '\n' : '') + line;
    }
  }
  if (current) sections.push(current);
  // First non-heading content before first ## becomes intro
  const introLines = [];
  for (const line of lines) {
    if (line.startsWith('## ')) break;
    introLines.push(line);
  }
  return {
    intro: introLines.join('\n').trim(),
    sections,
  };
}

// Render simple markdown bold/italic inline
function renderInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

// Render a markdown body block (paragraphs, headings h3, bullet lists)
function MarkdownBody({ text }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="font-display font-bold text-h4 text-text-dark mt-2" dangerouslySetInnerHTML={{ __html: renderInline(trimmed.replace(/^### /, '')) }} />;
        }
        const listLines = trimmed.split('\n').filter(l => l.trim().startsWith('- '));
        if (listLines.length > 0) {
          return (
            <ul key={i} className="list-disc list-inside flex flex-col gap-1">
              {listLines.map((l, j) => (
                <li key={j} className="text-body text-text-gray leading-relaxed" dangerouslySetInnerHTML={{ __html: renderInline(l.replace(/^\s*- /, '')) }} />
              ))}
            </ul>
          );
        }
        const numberedLines = trimmed.split('\n').filter(l => /^\d+\./.test(l.trim()));
        if (numberedLines.length > 0) {
          return (
            <ol key={i} className="list-decimal list-inside flex flex-col gap-1">
              {numberedLines.map((l, j) => (
                <li key={j} className="text-body text-text-gray leading-relaxed" dangerouslySetInnerHTML={{ __html: renderInline(l.replace(/^\d+\.\s*/, '')) }} />
              ))}
            </ol>
          );
        }
        return <p key={i} className="text-body text-text-gray leading-relaxed" dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }} />;
      })}
    </div>
  );
}
function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: 'left', willChange: 'transform', top: 'var(--nav-height, 72px)' }}
      className="fixed left-0 right-0 h-0.5 bg-coral z-50"
    />
  );
}

function TableOfContents({ sections, activeIdx }) {
  return (
    <nav className="sticky" style={{ top: 'calc(var(--nav-height, 72px) + 1.5rem)' }} aria-label="Table of contents">
      <p className="text-label font-bold text-text-dark uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <BookOpen className="w-3.5 h-3.5 text-coral" />
        Contents
      </p>
      <ul className="flex flex-col gap-1">
        {sections.map((s, i) => (
          <li key={i}>
            <a
              href={`#section-${i}`}
              className={cn(
                'block text-body-sm py-1.5 px-3 rounded-lg border-l-2 transition-all duration-200',
                activeIdx === i
                  ? 'border-coral text-coral bg-coral-50 font-semibold'
                  : 'border-transparent text-text-gray hover:text-coral hover:border-coral'
              )}
            >
              {s.heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ShareActions({ post }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-label font-bold text-text-dark uppercase tracking-wider hidden lg:block">Share</p>
      <div className="flex lg:flex-col gap-2">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`}
          target="_blank" rel="noopener noreferrer"
          className="w-9 h-9 rounded-xl bg-off-white border border-border-light flex items-center justify-center text-text-gray hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200 transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank" rel="noopener noreferrer"
          className="w-9 h-9 rounded-xl bg-off-white border border-border-light flex items-center justify-center text-text-gray hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </a>
        <button
          onClick={copy}
          className={cn(
            'w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200',
            copied
              ? 'bg-coral-50 border-coral text-coral'
              : 'bg-off-white border-border-light text-text-gray hover:bg-coral-50 hover:text-coral hover:border-coral'
          )}
          aria-label="Copy link"
        >
          <AnimatePresence mode="wait">
            <motion.span key={copied ? 'check' : 'link'} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Link2 className="w-4 h-4" />
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

function RelatedPosts({ current }) {
  const { posts } = useBlogPosts({ limit: 20 });
  // Same category first, then others — exclude current
  const related = [
    ...posts.filter((p) => p.id !== current.id && p.category === current.category),
    ...posts.filter((p) => p.id !== current.id && p.category !== current.category),
  ].slice(0, 3);

  if (!related.length) return null;
  return (
    <section className="mt-16 pt-10 border-t border-border-light">
      <h2 className="font-display font-bold text-h3 text-text-dark mb-6">Related Articles</h2>
      <div className="grid sm:grid-cols-3 gap-5">
        {related.map((p) => (
          <Link
            key={p.id}
            to={`/blog/${p.slug}`}
            className="group bg-white rounded-2xl border border-border-light hover:border-coral hover:shadow-level-1 transition-all duration-300 overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-coral to-coral-300" />
            <div className="p-5">
              <span className="text-label font-bold text-coral bg-coral-50 px-2.5 py-1 rounded-full">{p.category}</span>
              <h3 className="font-body font-bold text-text-dark mt-3 mb-2 leading-snug group-hover:text-coral transition-colors duration-200 line-clamp-2">
                {p.title}
              </h3>
              <p className="text-label text-text-gray flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {p.readTime}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Try DB first (slug-based), fall back to local static data
  const { post: dbPost, loading } = useBlogPost(id);
  const localPost    = blogPosts.find((p) => p.id === id);
  const localContent = blogContent[id];

  // Normalise to a unified shape
  const post = dbPost
    ? { ...dbPost, tags: dbPost.tags || [] }
    : localPost
      ? { ...localPost, slug: localPost.id, content: null }
      : null;

  const parsed = dbPost?.content ? parseMarkdown(dbPost.content) : null;
  const content = parsed || localContent || null;

  const [activeIdx, setActiveIdx] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const sectionRefs = useRef([]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section tracking
  useEffect(() => {
    if (!content?.sections) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target);
            if (idx !== -1) setActiveIdx(idx);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [content]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="w-10 h-10 rounded-full border-4 border-coral border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!post || !content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-off-white">
        <h1 className="font-display font-bold text-h2 text-text-dark">Article not found</h1>
        <Link to="/#blog" className="text-coral font-semibold hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <>
      <SEO title={post.title} description={post.excerpt} path={`/blog/${post.slug || post.id}`} type="article" />
      <ReadingProgressBar />

      <div className="min-h-screen bg-off-white">
        {/* Hero */}
        <div className="bg-white border-b border-border-light">
          <div className="max-w-container mx-auto px-4 md:px-8 py-10 lg:py-14">
            <Link
              to="/#blog"
              className="inline-flex items-center gap-2 text-body-sm font-semibold text-text-gray hover:text-coral transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Blog
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Category + read time */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-coral-50 text-coral text-label font-bold px-3 py-1 rounded-full border border-coral-100">
                  {post.category}
                </span>
                <span className="text-label text-text-gray flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {post.readTime}
                </span>
                <span className="text-label text-text-gray flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(post.date)}
                </span>
              </div>

              <h1 className="font-display font-bold text-h1 text-text-dark leading-tight mb-4 max-w-3xl">
                {post.title}
              </h1>
              <p className="text-body-lg text-text-gray max-w-2xl leading-relaxed mb-6">
                {post.excerpt}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coral-100 flex items-center justify-center text-coral font-bold font-display text-base">
                  CS
                </div>
                <div>
                  <p className="font-semibold text-body-sm text-text-dark">{post.author}</p>
                  <p className="text-label text-text-gray">Counselling Psychologist · NLP Practitioner</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-container mx-auto px-4 md:px-8 py-12">
          <div className="grid lg:grid-cols-[200px_1fr_200px] gap-10">

            {/* Left — ToC */}
            <div className="hidden lg:block">
              <TableOfContents sections={content.sections} activeIdx={activeIdx} />
            </div>

            {/* Article */}
            <article className="bg-white rounded-[1.5rem] border border-border-light shadow-level-1 overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--color-primary), #4D9697)' }} />
              <div className="px-6 md:px-10 py-10 prose-custom">
                {/* Intro */}
                <p className="text-body-lg text-text-gray leading-relaxed mb-10 pb-8 border-b border-border-light">
                  {content.intro}
                </p>

                {/* Sections */}
                {content.sections.map((section, i) => (
                  <div
                    key={i}
                    id={`section-${i}`}
                    ref={(el) => { sectionRefs.current[i] = el; }}
                    className="mb-10"
                  >
                    <h2 className="font-display font-bold text-h3 text-text-dark mb-3">
                      {section.heading}
                    </h2>
                    {typeof section.body === 'string'
                      ? <MarkdownBody text={section.body} />
                      : <p className="text-body text-text-gray leading-relaxed">{section.body}</p>
                    }
                  </div>
                ))}

                {/* Closing */}
                {content.closing && (
                  <div className="mt-10 pt-8 border-t border-border-light bg-coral-50 rounded-2xl px-6 py-5 border border-coral-100">
                    <p className="text-body text-coral-800 leading-relaxed italic">
                      {content.closing}
                    </p>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border-light">
                  <Tag className="w-4 h-4 text-text-gray mt-0.5" />
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-label px-3 py-1 bg-off-white border border-border-light rounded-full text-text-gray font-medium hover:border-coral hover:text-coral transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Author card */}
                <div className="mt-10 p-6 bg-cream-50 rounded-2xl border border-cream-200 flex gap-4">
                  <div className="w-14 h-14 rounded-full bg-coral-100 flex items-center justify-center text-coral font-bold font-display text-lg shrink-0">
                    CS
                  </div>
                  <div>
                    <p className="font-body font-bold text-text-dark">{post.author}</p>
                    <p className="text-label text-coral mb-2">Counselling Psychologist · 8+ years experience</p>
                    <p className="text-body-sm text-text-gray leading-relaxed">
                      M.A. in Counselling Psychology, NLP Practitioner, and Pranic Healer. Specialises in emotional healing, loneliness, and self-awareness. Available for in-person and online sessions.
                    </p>
                    <Button 
                      as={Link} 
                      to="/book" 
                      variant="ghost" 
                      size="sm" 
                      icon={ArrowRight} 
                      iconPosition="right"
                      className="mt-3 !p-0 text-accent hover:text-accent-dark font-bold hover:bg-transparent"
                    >
                      Begin your healing journey
                    </Button>
                  </div>
                </div>
              </div>
            </article>

            {/* Right — Share */}
            <div className="hidden lg:flex justify-center pt-10">
              <ShareActions post={post} />
            </div>
          </div>

          {/* Related */}
          <RelatedPosts current={post} />
        </div>

        {/* Back to top */}
        <AnimatePresence>
          {showTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-24 right-4 sm:right-6 z-40 w-10 h-10 rounded-full bg-white shadow-level-2 border border-border-light flex items-center justify-center text-text-gray hover:text-coral hover:border-coral transition-colors"
              aria-label="Back to top"
            >
              <ChevronUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default BlogPost;
