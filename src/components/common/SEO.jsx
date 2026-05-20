import { useEffect } from 'react';
import { injectStructuredData } from '@/lib/structuredData';

const DEFAULT = {
  title:       'TherapyConnect — Licensed Therapy in Bengaluru & Online',
  description: 'Book a session with Charushri Suhaney, RCI-Licensed Psychologist. Evidence-based therapy for anxiety, depression, relationships & more. In-person & online.',
  url:         'https://therapyconnect.in',
  image:       'https://therapyconnect.in/og-image.jpg',
  type:        'website',
  keywords:    'therapy Bengaluru, counselling psychologist, online therapy India, anxiety depression counselling, holistic healing, Charushri Suhaney',
};

function SEO({ title, description, path = '', type, noIndex = false, image, keywords, structuredData, article }) {
  const fullTitle      = title       ? `${title} | TherapyConnect` : DEFAULT.title;
  const metaDesc       = description || DEFAULT.description;
  const canonical      = `${DEFAULT.url}${path}`;
  const ogType         = type        || DEFAULT.type;
  const ogImage        = image       || DEFAULT.image;
  const metaKeywords   = keywords    || DEFAULT.keywords;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (selector, attrName, attrValue, content) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
      el.setAttribute('href', href);
    };

    setMeta('meta[name="description"]', 'name', 'description', metaDesc);
    setMeta('meta[name="keywords"]',    'name', 'keywords',    metaKeywords);
    setMeta('meta[name="robots"]',      'name', 'robots',      noIndex ? 'noindex,nofollow' : 'index,follow');
    setMeta('meta[name="author"]',      'name', 'author',      'Charushri Suhaney');

    setMeta('meta[property="og:title"]',       'property', 'og:title',       fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', metaDesc);
    setMeta('meta[property="og:url"]',         'property', 'og:url',         canonical);
    setMeta('meta[property="og:type"]',        'property', 'og:type',        ogType);
    setMeta('meta[property="og:image"]',       'property', 'og:image',       ogImage);
    setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
    setMeta('meta[property="og:image:height"]','property', 'og:image:height','630');
    setMeta('meta[property="og:site_name"]',   'property', 'og:site_name',   'TherapyConnect');
    setMeta('meta[property="og:locale"]',      'property', 'og:locale',      'en_IN');

    setMeta('meta[name="twitter:card"]',        'name', 'twitter:card',        'summary_large_image');
    setMeta('meta[name="twitter:site"]',        'name', 'twitter:site',        '@therapyconnect');
    setMeta('meta[name="twitter:title"]',       'name', 'twitter:title',       fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', metaDesc);
    setMeta('meta[name="twitter:image"]',       'name', 'twitter:image',       ogImage);

    if (article) {
      setMeta('meta[property="article:author"]',        'property', 'article:author',         article.author || 'Charushri Suhaney');
      setMeta('meta[property="article:published_time"]','property', 'article:published_time', article.publishedAt || '');
      setMeta('meta[property="article:modified_time"]', 'property', 'article:modified_time',  article.modifiedAt  || '');
      if (article.tags?.length) {
        setMeta('meta[property="article:tag"]', 'property', 'article:tag', article.tags.join(', '));
      }
    }

    setLink('canonical', canonical);
  }, [fullTitle, metaDesc, canonical, ogType, ogImage, metaKeywords, noIndex, article]);

  // Inject structured data
  useEffect(() => {
    if (!structuredData) return;
    return injectStructuredData(structuredData);
  }, [structuredData]);

  return null;
}

export default SEO;
