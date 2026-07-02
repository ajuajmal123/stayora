"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { ArrowLeft, Calendar, User, Compass, Tag, Sparkles } from "lucide-react";
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

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blogs/${slug}`);
        const body = await res.json();
        if (body.success && body.data) {
          setBlog(body.data);
        } else {
          setError(body.message || "Failed to load blog article");
        }
      } catch (err) {
        console.error(err);
        setError("Error connecting to the journal servers.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBlog();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-cream dark:bg-[#031c16] flex flex-col items-center justify-center">
        <Compass className="h-10 w-10 text-gold animate-spin-slow" />
        <span className="text-xs uppercase tracking-widest text-gold mt-4">Opening Chronicles...</span>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-luxury-cream dark:bg-[#031c16] flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <Compass className="h-10 w-10 text-gold animate-spin-slow" />
          <h2 className="font-display text-xl font-bold text-emerald-rich dark:text-gold mt-4">Article Not Found</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">{error || "This article may have been archived by the moderator."}</p>
          <Link href="/blogs" className="mt-6">
            <Button variant="luxury" size="md">Back to Journal</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-cream dark:bg-emerald-deep flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      {/* Article Hero banner */}
      <header className="relative w-full h-[50vh] min-h-[25rem] bg-[#031c16] border-b border-gold/15 flex items-end">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-rich via-[#031c16]/75 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl w-full mx-auto px-6 pb-12 text-left flex flex-col gap-4">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gold uppercase tracking-wider hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Journal
          </Link>

          <div className="flex flex-wrap gap-2 mt-2">
            {blog.tags.map((t) => (
              <span key={t} className="bg-gold/10 text-gold border border-gold/20 px-2.5 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-wider">
                {t}
              </span>
            ))}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight uppercase tracking-wide max-w-3xl">
            {blog.title}
          </h1>

          <div className="flex items-center gap-6 text-[10px] font-bold text-luxury-cream/70 uppercase tracking-widest mt-2 border-t border-luxury-cream/10 pt-4">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-gold" /> Written by {blog.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gold" /> Published {formatDate(blog.createdAt)}
            </span>
          </div>
        </div>
      </header>

      {/* Main article content reading space */}
      <main className="flex-grow max-w-3xl w-full mx-auto px-6 py-16 text-left">
        <article className="prose prose-emerald dark:prose-invert max-w-none">
          {/* Excerpt panel */}
          <p className="text-base sm:text-lg font-light text-emerald-rich/80 dark:text-luxury-cream/90 italic leading-relaxed border-l-2 border-gold pl-4 mb-10">
            {blog.excerpt}
          </p>

          {/* Render paragraph spaces beautifully */}
          <div className="text-sm text-emerald-rich/85 dark:text-luxury-cream/80 leading-relaxed font-light flex flex-col gap-6 whitespace-pre-wrap">
            {blog.content.split("\n\n").map((para, i) => {
              if (para.startsWith("### ")) {
                return (
                  <h3 key={i} className="font-display text-xl font-bold text-emerald-rich dark:text-gold uppercase tracking-wide mt-6 border-b border-gold/10 pb-1">
                    {para.replace("### ", "")}
                  </h3>
                );
              }
              if (para.startsWith("1. ") || para.startsWith("- ")) {
                return (
                  <ul key={i} className="list-inside list-disc pl-4 flex flex-col gap-2">
                    {para.split("\n").map((li, j) => (
                      <li key={j} className="text-xs sm:text-sm">
                        {li.replace(/^[0-9]\.\s*/, "").replace(/^-\s*/, "")}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-xs sm:text-sm md:text-base">
                  {para}
                </p>
              );
            })}
          </div>
        </article>

        {/* Footer actions */}
        <div className="border-t border-gold/15 mt-16 pt-8 flex items-center justify-between">
          <Link href="/blogs">
            <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold">
              <ArrowLeft className="h-3.5 w-3.5" /> All Stories
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-gold" /> Stayora Journal
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
