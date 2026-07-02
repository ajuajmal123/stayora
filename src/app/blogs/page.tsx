"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { Compass, Calendar, User, ArrowRight, Search, Tag, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  createdAt: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/blogs");
        const body = await res.json();
        if (body.success && body.data) {
          setBlogs(body.data);
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(blogs.flatMap((b) => b.tags || []))
  );

  // Filter logic
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag ? blog.tags.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-luxury-cream dark:bg-emerald-deep flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      {/* Hero Header */}
      <header className="relative py-24 bg-[#031c16] text-center text-white overflow-hidden flex flex-col items-center justify-center border-b border-gold/15">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1600&q=80"
            alt="Western Ghats Cover"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#031c16]/80 via-[#031c16]/95 to-[#031c16]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-gold uppercase tracking-[0.25em] text-xs font-bold animate-fade-in drop-shadow-md">
            <Sparkles className="h-4.5 w-4.5 text-gold animate-pulse" />
            Stayora Chronicles
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-light text-white leading-tight uppercase tracking-wider">
            Stayora <span className="font-semibold text-gold">Journal</span>
          </h1>
          <p className="text-xs text-luxury-cream/70 max-w-md leading-relaxed font-light mt-1">
            Immersive narratives, eco-tourism insights, and travel guides through the rich biodiversity of the Western Ghats and bespoke getaways.
          </p>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Left side: Blogs catalog */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Search bar & Tag chips */}
          <div className="bg-white dark:bg-emerald-deep/40 border border-gold/15 p-4 rounded-sm flex flex-col gap-4 shadow-sm text-left">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-rich/40 dark:text-luxury-cream/40" />
              <input
                type="text"
                placeholder="Search articles, guides, treks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-11 border border-gold/15 bg-luxury-cream/10 dark:bg-emerald-accent/10 rounded-sm text-xs focus:border-gold outline-none text-emerald-rich dark:text-luxury-cream"
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-gold-dark tracking-wider flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Filter Tags:
                </span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-colors border ${
                    selectedTag === null
                      ? "bg-gold text-[#031c16] border-gold"
                      : "border-gold/20 text-emerald-rich/70 dark:text-luxury-cream/70 hover:border-gold/45"
                  }`}
                >
                  All Articles
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-colors border ${
                      selectedTag === tag
                        ? "bg-gold text-[#031c16] border-gold"
                        : "border-gold/20 text-emerald-rich/70 dark:text-luxury-cream/70 hover:border-gold/45"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Blogs Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 bg-white dark:bg-emerald-deep/40 border border-gold/15 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
              {filteredBlogs.map((blog) => (
                <article
                  key={blog._id}
                  className="bg-white dark:bg-emerald-deep border border-gold/15 rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group text-left"
                >
                  {/* Cover Photo */}
                  <div className="h-48 w-full bg-luxury-sand overflow-hidden relative border-b border-gold/10 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {blog.tags.slice(0, 2).map((t) => (
                        <span key={t} className="bg-[#031c16]/80 backdrop-blur-sm text-gold border border-gold/25 px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4 text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gold" /> {blog.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gold" /> {formatDate(blog.createdAt)}
                        </span>
                      </div>
                      <h2 className="font-display text-lg font-bold text-emerald-rich dark:text-luxury-cream group-hover:text-gold transition-colors leading-tight line-clamp-2 mt-1">
                        {blog.title}
                      </h2>
                      <p className="text-xs text-muted-foreground font-light leading-relaxed line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>

                    <Link href={`/blogs/${blog.slug}`} className="mt-2 self-start">
                      <Button variant="luxury" size="sm" className="h-8 text-[10px] tracking-wider font-bold uppercase px-4 flex items-center gap-2">
                        Read Story <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-gold/20 rounded-sm bg-white dark:bg-emerald-deep">
              <Compass className="h-10 w-10 text-gold mx-auto animate-spin-slow" />
              <h3 className="font-display text-lg font-bold text-emerald-rich dark:text-gold mt-4">No Articles Found</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                Try refining your search terms or selecting another tag filter category.
              </p>
            </div>
          )}

        </div>

        {/* Right side: Author Spotlight / Newsletter sidebar */}
        <aside className="w-full md:w-80 shrink-0 flex flex-col gap-6 text-left">
          
          {/* Author box */}
          <div className="border border-gold/15 p-6 rounded-sm bg-white dark:bg-emerald-deep/40 flex flex-col gap-4">
            <h3 className="font-display text-sm font-bold text-emerald-rich dark:text-gold uppercase tracking-wider border-b border-emerald-rich/5 pb-2">
              Western Ghats Spotlight
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-light">
              Spanning over 1,600 km along India's southwestern spine, the Western Ghats represent one of the oldest rainforest ecosystems. Our journalists travel deep into these forests to bring you stories of eco-tourism, local farming, and trekking trails.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80"
              alt="Ghats Nature"
              className="w-full h-32 object-cover rounded-sm border border-gold/10"
            />
          </div>

          {/* Quick tips */}
          <div className="border border-gold/15 p-6 rounded-sm bg-white dark:bg-emerald-deep/40 flex flex-col gap-3">
            <h3 className="font-display text-sm font-bold text-emerald-rich dark:text-gold uppercase tracking-wider border-b border-emerald-rich/5 pb-2">
              Trekking Guidelines
            </h3>
            <ul className="text-[10px] text-muted-foreground flex flex-col gap-2 font-light list-disc list-inside">
              <li>Always check weather warnings before heading out.</li>
              <li>Trek with government-certified guides.</li>
              <li>Respect "No Littering" norms strictly.</li>
              <li>Pack eco-safe leech protection sprays.</li>
            </ul>
          </div>
        </aside>

      </main>

      <Footer />
    </div>
  );
}
