import { BlogPost } from '@/types/blog';
import { BlogCard } from '@/components/organisms';

// This could come from a CMS, API, or environment config
const getBlogPosts = (): BlogPost[] => {
  // Check if blog is enabled
  const blogEnabled = process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true'
  
  if (!blogEnabled) {
    return []
  }

  // Return blog posts (could be fetched from CMS)
  // For now, return empty array - you can add blog posts here or fetch from CMS
  return [
    // Example blog posts (uncomment and customize when ready):
    // {
    //   id: 1,
    //   title: "B2B Sourcing Guide for Latin America",
    //   excerpt: "Learn how to effectively source products from trusted Latin American suppliers.",
    //   image: '/images/blog/post-1.jpg',
    //   category: 'GUIDE',
    //   href: '/blog/b2b-sourcing-guide',
    // },
  ]
}

export function BlogSection() {
  const blogPosts = getBlogPosts()

  if (blogPosts.length === 0) {
    return null // Don't render if no blog posts
  }

  return (
    <section className='bg-tertiary container'>
      <div className='flex items-center justify-between mb-12'>
        <h2 className='heading-lg text-tertiary'>
          STAY UP TO DATE
        </h2>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3'>
        {blogPosts.map((post, index) => (
          <BlogCard
            key={post.id}
            index={index}
            post={post}
          />
        ))}
      </div>
    </section>
  );
}
