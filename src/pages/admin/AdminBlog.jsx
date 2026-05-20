import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, Upload, X, ArrowLeft } from 'lucide-react';
import { adminRepository } from '@/repositories/adminRepository';
import { useToast }        from '@/context/ToastContext';
import {
  PageHeader, AdminCard, StatusBadge, AdminBtn,
  AdminInput, AdminTextarea, AdminSelect, ConfirmDialog, EmptyState,
} from '@/components/admin/AdminComponents';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Anxiety','Mindfulness','About Therapy','Relationships','Burnout','Trauma','General'];

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').slice(0, 80);
}

function BlogForm({ post, onSave, onCancel }) {
  const { toast } = useToast();
  const fileRef   = useRef();
  const [form, setForm] = useState({
    title:          post?.title          || '',
    slug:           post?.slug           || '',
    excerpt:        post?.excerpt        || '',
    content:        post?.content        || '',
    category:       post?.category       || 'General',
    tags:           (post?.tags || []).join(', '),
    author_name:    post?.author_name    || 'Charushri Suhaney',
    read_time:      post?.read_time      || '',
    cover_image_url:post?.cover_image_url|| '',
    status:         post?.status         || 'draft',
    is_featured:    post?.is_featured    || false,
  });
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleTitleChange = (v) => {
    set('title', v);
    if (!post?.id) set('slug', generateSlug(v));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminRepository.uploadBlogImage(file);
      set('cover_image_url', url);
      toast({ type: 'success', title: 'Image uploaded' });
    } catch {
      toast({ type: 'error', title: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.content || !form.slug) {
      toast({ type: 'error', title: 'Title, slug, and content are required' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        id:   post?.id,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      delete payload.tags_str;
      const saved = await adminRepository.upsertBlogPost(payload);
      onSave(saved);
      toast({ type: 'success', title: post?.id ? 'Post updated' : 'Post created' });
    } catch (err) {
      toast({ type: 'error', title: 'Save failed', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="p-2 hover:bg-cream-50 rounded-xl text-text-gray">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <PageHeader
          title={post?.id ? 'Edit Post' : 'New Blog Post'}
          subtitle="Write and publish articles for your readers"
          action={
            <div className="flex gap-2">
              <AdminBtn variant="secondary" onClick={onCancel}>Cancel</AdminBtn>
              <AdminBtn variant="primary" onClick={handleSave} loading={saving}>
                {form.status === 'published' ? 'Publish' : 'Save Draft'}
              </AdminBtn>
            </div>
          }
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main */}
        <div className="flex flex-col gap-5">
          <AdminCard>
            <div className="flex flex-col gap-4">
              <AdminInput
                label="Title *"
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Post title…"
              />
              <AdminInput
                label="Slug *"
                value={form.slug}
                onChange={e => set('slug', e.target.value)}
                placeholder="post-url-slug"
              />
              <AdminTextarea
                label="Excerpt *"
                value={form.excerpt}
                onChange={e => set('excerpt', e.target.value)}
                placeholder="Brief description shown in listings…"
                className="min-h-[80px]"
              />
            </div>
          </AdminCard>

          <AdminCard title="Content">
            <AdminTextarea
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder="Write your article in Markdown…"
              className="min-h-[400px] font-mono text-body-sm"
            />
          </AdminCard>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Status & Visibility */}
          <AdminCard title="Publish">
            <div className="flex flex-col gap-3">
              <AdminSelect label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </AdminSelect>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={e => set('is_featured', e.target.checked)}
                  className="w-4 h-4 accent-teal-600"
                />
                <span className="text-body-sm text-text-dark font-semibold">Featured article</span>
              </label>
            </div>
          </AdminCard>

          {/* Cover Image */}
          <AdminCard title="Cover Image">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleImageUpload(e.target.files?.[0])}
            />
            {form.cover_image_url ? (
              <div className="relative">
                <img
                  src={form.cover_image_url}
                  alt="Cover"
                  className="w-full h-36 object-cover rounded-xl"
                />
                <button
                  onClick={() => set('cover_image_url', '')}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow text-text-gray hover:text-error"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-32 border-2 border-dashed border-border-light rounded-xl flex flex-col items-center justify-center gap-2 hover:border-teal-300 hover:bg-teal-50/30 transition-all text-text-gray"
              >
                <Upload className="w-5 h-5" />
                <span className="text-body-sm">{uploading ? 'Uploading…' : 'Upload image'}</span>
              </button>
            )}
          </AdminCard>

          {/* Metadata */}
          <AdminCard title="Metadata">
            <div className="flex flex-col gap-3">
              <AdminSelect label="Category" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </AdminSelect>
              <AdminInput
                label="Tags (comma-separated)"
                value={form.tags}
                onChange={e => set('tags', e.target.value)}
                placeholder="anxiety, mindfulness, cbt"
              />
              <AdminInput
                label="Author"
                value={form.author_name}
                onChange={e => set('author_name', e.target.value)}
              />
              <AdminInput
                label="Read time"
                value={form.read_time}
                onChange={e => set('read_time', e.target.value)}
                placeholder="5 min read"
              />
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlog() {
  const [posts,    setPosts]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [editing,  setEditing] = useState(null);  // null=list, 'new'=new, {post}=edit
  const [deleting, setDeleting]= useState(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try { setPosts(await adminRepository.getAllBlogPosts()); }
    catch { toast({ type: 'error', title: 'Failed to load posts' }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = (saved) => {
    setPosts(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      return idx >= 0 ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev];
    });
    setEditing(null);
  };

  const handleDelete = async () => {
    try {
      await adminRepository.deleteBlogPost(deleting.id);
      setPosts(prev => prev.filter(p => p.id !== deleting.id));
      toast({ type: 'success', title: 'Post deleted' });
    } catch {
      toast({ type: 'error', title: 'Delete failed' });
    } finally {
      setDeleting(null);
    }
  };

  const togglePublish = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      const updated = await adminRepository.upsertBlogPost({ id: post.id, status: newStatus });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: updated.status } : p));
      toast({ type: 'success', title: newStatus === 'published' ? 'Post published' : 'Post unpublished' });
    } catch {
      toast({ type: 'error', title: 'Failed to update' });
    }
  };

  if (editing !== null) {
    return (
      <BlogForm
        post={editing === 'new' ? null : editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle={`${posts.length} posts`}
        action={
          <AdminBtn variant="primary" onClick={() => setEditing('new')}>
            <Plus className="w-4 h-4" /> New Post
          </AdminBtn>
        }
      />

      <AdminCard>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-cream-50 animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            title="No blog posts yet"
            message="Create your first article to share insights with your clients."
            action={<AdminBtn variant="primary" onClick={() => setEditing('new')}><Plus className="w-4 h-4" />Write first post</AdminBtn>}
          />
        ) : (
          <div className="flex flex-col divide-y divide-border-light">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-body-sm font-semibold text-text-dark truncate">{p.title}</p>
                    <StatusBadge status={p.status} />
                    {p.is_featured && (
                      <span className="flex items-center gap-1 text-label text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400" /> Featured
                      </span>
                    )}
                  </div>
                  <p className="text-label text-text-gray">{p.category} · {p.views || 0} views</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <AdminBtn
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePublish(p)}
                    title={p.status === 'published' ? 'Unpublish' : 'Publish'}
                  >
                    {p.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </AdminBtn>
                  <AdminBtn variant="ghost" size="sm" onClick={() => setEditing(p)}>
                    <Edit2 className="w-4 h-4" />
                  </AdminBtn>
                  <AdminBtn variant="ghost" size="sm" onClick={() => setDeleting(p)} className="hover:text-error">
                    <Trash2 className="w-4 h-4" />
                  </AdminBtn>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <ConfirmDialog
        open={!!deleting}
        title="Delete post?"
        message={`"${deleting?.title}" will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        danger
      />
    </div>
  );
}
