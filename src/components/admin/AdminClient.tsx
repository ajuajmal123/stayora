"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Home,
  Calendar,
  Users,
  Compass,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  IndianRupee,
  Briefcase,
  FileImage,
  Upload,
  UserX,
  UserCheck,
  Eye,
  MapPin,
  ListOrdered,
  Layers,
  Mail,
  RefreshCw,
  Gift,
  Compass as CompassIcon,
  LogOut,
  BookOpen
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface AdminClientProps {
  initialProperties: any[];
  initialBookings: any[];
  initialUsers: any[];
  initialDestinations: any[];
  initialBanners: any[];
  initialPackages: any[];
}

export const AdminClient: React.FC<AdminClientProps> = ({
  initialProperties,
  initialBookings,
  initialUsers,
  initialDestinations,
  initialBanners,
  initialPackages
}) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out of the Stayora Admin Console?")) {
      const success = await logout();
      if (success) {
        router.refresh();
      }
    }
  };

  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "bookings" | "users" | "content" | "blogs">("overview");
  const [contentSubTab, setContentSubTab] = useState<"destinations" | "banners" | "packages">("destinations");

  // State arrays
  const [properties, setProperties] = useState(initialProperties);
  const [bookings, setBookings] = useState(initialBookings);
  const [users, setUsers] = useState(initialUsers);
  const [destinations, setDestinations] = useState(initialDestinations);
  const [banners, setBanners] = useState(initialBanners);
  const [packages, setPackages] = useState(initialPackages || []);
  const [blogs, setBlogs] = useState<any[]>([]);

  // Blogs Form States
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    coverImage: "",
    author: "Stayora Host",
    tags: ""
  });
  const [isSavingBlog, setIsSavingBlog] = useState(false);

  // Availability Calendar states
  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [calProperty, setCalProperty] = useState<any>(null);
  const [calBlockedDates, setCalBlockedDates] = useState<string[]>([]);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [isSavingCal, setIsSavingCal] = useState(false);

  // Analytics states
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Property modal states
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [propertyForm, setPropertyForm] = useState({
    title: "",
    description: "",
    type: "villa",
    status: "draft",
    pricePerNight: "",
    address: "",
    city: "",
    country: "",
    amenities: "",
    bedrooms: "1",
    bathrooms: "1",
    maxGuests: "2",
    images: [] as string[],
    destination: "",
    unavailableDates: "",
    rules: ""
  });
  const [propertyError, setPropertyError] = useState("");
  const [isSavingProperty, setIsSavingProperty] = useState(false);

  // Destination Form
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [editingDestId, setEditingDestId] = useState<string | null>(null);
  const [destForm, setDestForm] = useState({
    name: "",
    description: "",
    image: "",
    isFeatured: false,
    popularSpots: [] as { name: string; image: string; activities: string[] }[]
  });
  const [isSavingDest, setIsSavingDest] = useState(false);

  // Banner Form
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "/",
    isActive: true,
    order: "0"
  });
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  // Tour Package Form
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageForm, setPackageForm] = useState({
    title: "",
    description: "",
    duration: "",
    price: "",
    location: "",
    image: "",
    isFeatured: false
  });
  const [isSavingPackage, setIsSavingPackage] = useState(false);

  // Custom Booking Form
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    propertyId: "",
    name: "",
    email: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
    totalPrice: "",
    status: "pending",
    paymentStatus: "unpaid",
    customAmenities: "",
    customRules: "",
    phoneNumber: ""
  });
  const [bookingFormError, setBookingFormError] = useState("");
  const [isSavingBooking, setIsSavingBooking] = useState(false);

  // Image zoom modal
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const body = await res.json();
      if (body.success) {
        setAnalytics(body.data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      const body = await res.json();
      if (body.success && body.data) {
        setBlogs(body.data);
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchBlogs();
  }, []);

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBlog(true);
    try {
      const url = "/api/admin/blogs";
      const method = editingBlogId ? "PUT" : "POST";
      const payload = editingBlogId ? { ...blogForm, id: editingBlogId } : blogForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (body.success && body.data) {
        if (editingBlogId) {
          setBlogs((prev) => prev.map((b) => (b._id === editingBlogId ? body.data : b)));
        } else {
          setBlogs((prev) => [body.data, ...prev]);
        }
        setIsBlogModalOpen(false);
        alert("Blog post saved successfully.");
      } else {
        alert(body.message || "Failed to save blog post");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving blog post");
    } finally {
      setIsSavingBlog(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" });
      const body = await res.json();
      if (body.success) {
        setBlogs((prev) => prev.filter((b) => b._id !== id));
        alert("Blog post deleted successfully.");
      } else {
        alert(body.message || "Failed to delete blog post");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting blog post");
    }
  };

  const openCreateBlog = () => {
    setEditingBlogId(null);
    setBlogForm({
      title: "",
      content: "",
      excerpt: "",
      coverImage: "",
      author: "Stayora Host",
      tags: ""
    });
    setIsBlogModalOpen(true);
  };

  const openEditBlog = (blog: any) => {
    setEditingBlogId(blog._id);
    setBlogForm({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      coverImage: blog.coverImage,
      author: blog.author || "Stayora Host",
      tags: (blog.tags || []).join(", ")
    });
    setIsBlogModalOpen(true);
  };

  // Update booking status helper
  const handleUpdateBooking = async (bookingId: string, status?: string, paymentStatus?: string) => {
    if (!confirm("Are you sure you want to update this booking's state?")) return;

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status, paymentStatus })
      });
      const body = await res.json();

      if (body.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, ...body.data } : b))
        );
        fetchAnalytics(); // reload stats
        alert("Booking status updated successfully.");
      } else {
        alert(body.message || "Failed to update booking.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating booking.");
    }
  };

  // Toggle user blocking status
  const handleToggleUserBlock = async (userId: string, currentBlocked: boolean) => {
    const targetStatus = !currentBlocked;
    if (
      !confirm(
        `Are you sure you want to ${targetStatus ? "BLOCK" : "UNBLOCK"} this user? ${
          targetStatus ? "They will be disconnected and unable to log in." : ""
        }`
      )
    )
      return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isBlocked: targetStatus })
      });
      const body = await res.json();

      if (body.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isBlocked: targetStatus } : u))
        );
        alert(`User successfully ${targetStatus ? "blocked" : "unblocked"}.`);
      } else {
        alert(body.message || "Failed to toggle user block status.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating user.");
    }
  };

  // Delete property helper
  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "DELETE"
      });
      const body = await res.json();

      if (body.success) {
        setProperties((prev) => prev.filter((p) => p._id !== propertyId));
        fetchAnalytics();
        alert("Property deleted successfully.");
      } else {
        alert(body.message || "Failed to delete property.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error deleting property.");
    }
  };

  // Handle multi-image uploads as base64 strings
  const handlePropertyImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const loadedImages: string[] = [];
      let loadedCount = 0;

      Array.from(files).forEach((file) => {
        if (file.size > 4 * 1024 * 1024) {
          alert("Each photo must be smaller than 4MB");
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          loadedImages.push(reader.result as string);
          loadedCount++;
          if (loadedCount === files.length) {
            setPropertyForm((prev) => ({
              ...prev,
              images: [...prev.images, ...loadedImages]
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Save property submit
  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPropertyError("");
    setIsSavingProperty(true);

    try {
      const url = editingPropertyId
        ? `/api/admin/properties/${editingPropertyId}`
        : "/api/admin/properties";
      const method = editingPropertyId ? "PUT" : "POST";

      const payload = {
        ...propertyForm,
        destination: propertyForm.destination || null,
        pricePerNight: Number(propertyForm.pricePerNight),
        bedrooms: Number(propertyForm.bedrooms),
        bathrooms: Number(propertyForm.bathrooms),
        maxGuests: Number(propertyForm.maxGuests),
        amenities: propertyForm.amenities.split(",").map((s) => s.trim()).filter(Boolean),
        unavailableDates: propertyForm.unavailableDates.split(",").map((s) => s.trim()).filter(Boolean),
        rules: propertyForm.rules ? propertyForm.rules.split(",").map((s) => s.trim()).filter(Boolean) : []
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await res.json();

      if (body.success && body.data) {
        if (editingPropertyId) {
          setProperties((prev) =>
            prev.map((p) => (p._id === editingPropertyId ? body.data : p))
          );
        } else {
          setProperties((prev) => [body.data, ...prev]);
        }
        setIsPropertyModalOpen(false);
        fetchAnalytics();
      } else {
        setPropertyError(body.message || "Failed to save property");
      }
    } catch (err) {
      console.error(err);
      setPropertyError("An unexpected error occurred saving the property.");
    } finally {
      setIsSavingProperty(false);
    }
  };

  // Trigger Edit property form open
  const openEditProperty = (property: any) => {
    setEditingPropertyId(property._id);
    setPropertyForm({
      title: property.title,
      description: property.description,
      type: property.type,
      status: property.status,
      pricePerNight: property.pricePerNight.toString(),
      address: property.address,
      city: property.city,
      country: property.country,
      amenities: (property.amenities || []).join(", "),
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      maxGuests: property.maxGuests.toString(),
      images: property.images || [],
      destination: property.destination?._id || property.destination || "",
      unavailableDates: (property.unavailableDates || []).join(", "),
      rules: (property.rules || []).join(", ")
    });
    setIsPropertyModalOpen(true);
  };

  const openCreateProperty = () => {
    setEditingPropertyId(null);
    setPropertyForm({
      title: "",
      description: "",
      type: "villa",
      status: "draft",
      pricePerNight: "",
      address: "",
      city: "",
      country: "",
      amenities: "Pool, WiFi, Air Conditioning, Concierge",
      bedrooms: "2",
      bathrooms: "2",
      maxGuests: "4",
      images: [],
      destination: "",
      unavailableDates: "",
      rules: "CHECK-IN TIME: 02:00 PM, CHECK-OUT TIME: 11:00 AM, CANCELLATION POLICY: Non-refundable, NO SMOKING: Inside bedrooms"
    });
    setIsPropertyModalOpen(true);
  };

  const openCalendarController = (property: any) => {
    setCalProperty(property);
    setCalBlockedDates(property.unavailableDates || []);
    setCalYear(new Date().getFullYear());
    setCalMonth(new Date().getMonth());
    setIsCalModalOpen(true);
  };

  const handleToggleCalDate = (dateStr: string) => {
    setCalBlockedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleSaveCalendar = async () => {
    if (!calProperty) return;
    setIsSavingCal(true);
    try {
      const res = await fetch(`/api/admin/properties/${calProperty._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...calProperty,
          unavailableDates: calBlockedDates
        })
      });
      const body = await res.json();
      if (body.success && body.data) {
        setProperties((prev) => prev.map((p) => (p._id === calProperty._id ? body.data : p)));
        setIsCalModalOpen(false);
        alert("Availability calendar updated successfully.");
      } else {
        alert(body.message || "Failed to update calendar.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving availability calendar.");
    } finally {
      setIsSavingCal(false);
    }
  };

  const openCreateBooking = () => {
    setBookingForm({
      propertyId: "",
      name: "",
      email: "",
      checkIn: "",
      checkOut: "",
      guests: "1",
      totalPrice: "",
      status: "pending",
      paymentStatus: "unpaid",
      customAmenities: "",
      customRules: "",
      phoneNumber: ""
    });
    setBookingFormError("");
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingFormError("");
    setIsSavingBooking(true);

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingForm,
          guests: Number(bookingForm.guests),
          totalPrice: Number(bookingForm.totalPrice),
        })
      });
      const body = await res.json();

      if (body.success && body.data) {
        setBookings((prev) => [body.data, ...prev]);
        setIsBookingModalOpen(false);
        fetchAnalytics();
        alert("Custom booking created successfully.");
      } else {
        setBookingFormError(body.message || "Failed to create booking.");
      }
    } catch (err) {
      console.error(err);
      setBookingFormError("An unexpected error occurred saving the booking.");
    } finally {
      setIsSavingBooking(false);
    }
  };

  // Destinations Management
  const handleDestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDest(true);
    try {
      const url = "/api/admin/destinations";
      const method = editingDestId ? "PUT" : "POST";
      const payload = editingDestId ? { ...destForm, id: editingDestId } : destForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (body.success && body.data) {
        if (editingDestId) {
          setDestinations((prev) => prev.map((d) => (d._id === editingDestId ? body.data : d)));
        } else {
          setDestinations((prev) => [body.data, ...prev]);
        }
        setIsDestModalOpen(false);
      } else {
        alert(body.message || "Failed to save destination");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingDest(false);
    }
  };

  const handleDeleteDest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;
    try {
      const res = await fetch(`/api/admin/destinations?id=${id}`, { method: "DELETE" });
      const body = await res.json();
      if (body.success) {
        setDestinations((prev) => prev.filter((d) => d._id !== id));
      } else {
        alert(body.message || "Failed to delete destination");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateDest = () => {
    setEditingDestId(null);
    setDestForm({ name: "", description: "", image: "", isFeatured: false, popularSpots: [] });
    setIsDestModalOpen(true);
  };

  const openEditDest = (dest: any) => {
    setEditingDestId(dest._id);
    setDestForm({
      name: dest.name,
      description: dest.description,
      image: dest.image,
      isFeatured: dest.isFeatured,
      popularSpots: dest.popularSpots || []
    });
    setIsDestModalOpen(true);
  };

  const addPopularSpot = () => {
    setDestForm((prev) => ({
      ...prev,
      popularSpots: [
        ...(prev.popularSpots || []),
        { name: "", image: "", activities: [] }
      ]
    }));
  };

  const removePopularSpot = (index: number) => {
    setDestForm((prev) => ({
      ...prev,
      popularSpots: (prev.popularSpots || []).filter((_, idx) => idx !== index)
    }));
  };

  const updatePopularSpotField = (index: number, field: string, value: any) => {
    setDestForm((prev) => {
      const updated = [...(prev.popularSpots || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, popularSpots: updated };
    });
  };

  const handleSpotImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Image must be smaller than 4MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePopularSpotField(index, "image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Banners Management
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBanner(true);
    try {
      const url = "/api/admin/banners";
      const method = editingBannerId ? "PUT" : "POST";
      const payload = editingBannerId ? { ...bannerForm, id: editingBannerId } : bannerForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (body.success && body.data) {
        if (editingBannerId) {
          setBanners((prev) => prev.map((b) => (b._id === editingBannerId ? body.data : b)));
        } else {
          setBanners((prev) => [body.data, ...prev]);
        }
        setIsBannerModalOpen(false);
      } else {
        alert(body.message || "Failed to save banner");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero banner?")) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      const body = await res.json();
      if (body.success) {
        setBanners((prev) => prev.filter((b) => b._id !== id));
      } else {
        alert(body.message || "Failed to delete banner");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateBanner = () => {
    setEditingBannerId(null);
    setBannerForm({ title: "", subtitle: "", image: "", link: "/", isActive: true, order: "0" });
    setIsBannerModalOpen(true);
  };

  const openEditBanner = (banner: any) => {
    setEditingBannerId(banner._id);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image,
      link: banner.link || "/",
      isActive: banner.isActive,
      order: banner.order.toString()
    });
    setIsBannerModalOpen(true);
  };

  // Tour Packages Management
  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPackage(true);
    try {
      const url = "/api/admin/packages";
      const method = editingPackageId ? "PUT" : "POST";
      const payload = editingPackageId ? { ...packageForm, id: editingPackageId } : packageForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (body.success && body.data) {
        if (editingPackageId) {
          setPackages((prev) => prev.map((p) => (p._id === editingPackageId ? body.data : p)));
        } else {
          setPackages((prev) => [body.data, ...prev]);
        }
        setIsPackageModalOpen(false);
      } else {
        alert(body.message || "Failed to save tour package");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPackage(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this travel package?")) return;
    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, { method: "DELETE" });
      const body = await res.json();
      if (body.success) {
        setPackages((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert(body.message || "Failed to delete package");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCreatePackage = () => {
    setEditingPackageId(null);
    setPackageForm({ title: "", description: "", duration: "", price: "", location: "", image: "", isFeatured: false });
    setIsPackageModalOpen(true);
  };

  const openEditPackage = (pack: any) => {
    setEditingPackageId(pack._id);
    setPackageForm({
      title: pack.title,
      description: pack.description,
      duration: pack.duration,
      price: pack.price.toString(),
      location: pack.location,
      image: pack.image,
      isFeatured: pack.isFeatured
    });
    setIsPackageModalOpen(true);
  };


  // Status badge styling helper
  const renderStatus = (status: string) => {
    const styles = {
      pending: "bg-amber-400/10 text-amber-500 border-amber-500/20",
      confirmed: "bg-emerald-400/10 text-emerald-500 border-emerald-500/20",
      cancelled: "bg-red-400/10 text-red-500 border-red-500/20",
      completed: "bg-blue-400/10 text-blue-500 border-blue-500/20"
    };
    const s = status.toLowerCase() as keyof typeof styles;
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border", styles[s] || "")}>
        {status}
      </span>
    );
  };

  const renderPaymentStatus = (status: string) => {
    const styles = {
      unpaid: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      paid: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      refunded: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    };
    const s = status.toLowerCase() as keyof typeof styles;
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border", styles[s] || "")}>
        {status}
      </span>
    );
  };

  // Helper for single image files loaded
  const handleSingleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setForm: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Image must be smaller than 4MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev: any) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // SVG Chart rendering math
  const trendData = analytics?.revenueTrend || [];
  const maxRevenue = trendData.length > 0 ? Math.max(...trendData.map((d: any) => d.revenue), 10000) : 10000;
  const chartHeight = 160;
  const chartWidth = 580;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-start text-left font-sans">
      {/* Sidebar navigation */}
      <div className="w-full lg:w-64 bg-white dark:bg-emerald-deep border border-gold/15 rounded-sm p-3 lg:p-4 flex flex-row flex-wrap lg:flex-col gap-2 shrink-0">
        <div className="w-full px-4 py-2 border-b border-gold/10 lg:mb-2 flex items-center gap-2 shrink-0">
          <Award className="h-5 w-5 text-gold" />
          <span className="font-display font-bold text-base lg:text-lg text-emerald-rich dark:text-gold uppercase tracking-wide">
            Stayora Admin
          </span>
        </div>

        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors text-left flex-1 lg:flex-none min-w-[140px] lg:min-w-0",
            activeTab === "overview"
              ? "bg-gold/10 text-gold border border-gold/25"
              : "text-emerald-rich/70 dark:text-luxury-cream/70 hover:bg-emerald-rich/5 border border-transparent"
          )}
        >
          <LayoutDashboard className="h-4.5 w-4.5" /> Overview
        </button>

        <button
          onClick={() => setActiveTab("properties")}
          className={cn(
            "flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors text-left flex-1 lg:flex-none min-w-[140px] lg:min-w-0",
            activeTab === "properties"
              ? "bg-gold/10 text-gold border border-gold/25"
              : "text-emerald-rich/70 dark:text-luxury-cream/70 hover:bg-emerald-rich/5 border border-transparent"
          )}
        >
          <Home className="h-4.5 w-4.5" /> Properties
        </button>

        <button
          onClick={() => setActiveTab("bookings")}
          className={cn(
            "flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors text-left flex-1 lg:flex-none min-w-[140px] lg:min-w-0",
            activeTab === "bookings"
              ? "bg-gold/10 text-gold border border-gold/25"
              : "text-emerald-rich/70 dark:text-luxury-cream/70 hover:bg-emerald-rich/5 border border-transparent"
          )}
        >
          <Calendar className="h-4.5 w-4.5" /> Bookings
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={cn(
            "flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors text-left flex-1 lg:flex-none min-w-[140px] lg:min-w-0",
            activeTab === "users"
              ? "bg-gold/10 text-gold border border-gold/25"
              : "text-emerald-rich/70 dark:text-luxury-cream/70 hover:bg-emerald-rich/5 border border-transparent"
          )}
        >
          <Users className="h-4.5 w-4.5" /> Accounts
        </button>

        <button
          onClick={() => setActiveTab("content")}
          className={cn(
            "flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors text-left flex-1 lg:flex-none min-w-[140px] lg:min-w-0",
            activeTab === "content"
              ? "bg-gold/10 text-gold border border-gold/25"
              : "text-emerald-rich/70 dark:text-luxury-cream/70 hover:bg-emerald-rich/5 border border-transparent"
          )}
        >
          <Compass className="h-4.5 w-4.5" /> Content
        </button>

        <button
          onClick={() => setActiveTab("blogs")}
          className={cn(
            "flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors text-left flex-1 lg:flex-none min-w-[140px] lg:min-w-0",
            activeTab === "blogs"
              ? "bg-gold/10 text-gold border border-gold/25"
              : "text-emerald-rich/70 dark:text-luxury-cream/70 hover:bg-emerald-rich/5 border border-transparent"
          )}
        >
          <BookOpen className="h-4.5 w-4.5" /> Blogs
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors text-left text-red-500 hover:bg-red-500/10 border border-transparent lg:mt-4 lg:border-t lg:border-gold/10 lg:pt-4 flex-grow lg:flex-grow-0 min-w-[120px] lg:min-w-0"
        >
          <LogOut className="h-4.5 w-4.5" /> Log Out
        </button>
      </div>

      {/* Main Administrative Container */}
      <div className="flex-1 w-full bg-white dark:bg-emerald-deep border border-gold/15 p-6 sm:p-8 rounded-sm shadow-sm min-h-[30rem]">
        {/* Tab 1: Overview Dashboard */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-gold/10 pb-4">
              <h2 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold uppercase tracking-wider">
                Overview & Analytics
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-9 text-xs"
                onClick={fetchAnalytics}
                isLoading={isLoadingAnalytics}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh Stats
              </Button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border border-gold/15 p-5 bg-emerald-rich/[0.01] rounded-sm flex items-center gap-4">
                <div className="h-12 w-12 rounded-full border border-gold/20 flex items-center justify-center text-gold shrink-0">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Total Revenue
                  </span>
                  <span className="text-xl font-bold text-emerald-rich dark:text-gold font-display mt-0.5 block">
                    {formatCurrency(analytics?.summary?.totalRevenue || 0)}
                  </span>
                </div>
              </div>

              <div className="border border-gold/15 p-5 bg-emerald-rich/[0.01] rounded-sm flex items-center gap-4">
                <div className="h-12 w-12 rounded-full border border-gold/20 flex items-center justify-center text-gold shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Bookings Paid
                  </span>
                  <span className="text-xl font-bold text-emerald-rich dark:text-gold font-display mt-0.5 block">
                    {analytics?.summary?.totalBookings || 0} Stays
                  </span>
                </div>
              </div>

              <div className="border border-gold/15 p-5 bg-emerald-rich/[0.01] rounded-sm flex items-center gap-4">
                <div className="h-12 w-12 rounded-full border border-gold/20 flex items-center justify-center text-gold shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="flex-grow">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Occupancy Rate
                  </span>
                  <span className="text-xl font-bold text-emerald-rich dark:text-gold font-display mt-0.5 block">
                    {analytics?.summary?.occupancyRate || 0}%
                  </span>
                  <div className="w-full bg-emerald-rich/10 h-1.5 rounded-full mt-2 overflow-hidden border border-gold/5">
                    <div
                      className="bg-gold h-full transition-all duration-700"
                      style={{ width: `${analytics?.summary?.occupancyRate || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="border border-gold/15 p-5 bg-emerald-rich/[0.01] rounded-sm flex items-center gap-4">
                <div className="h-12 w-12 rounded-full border border-gold/20 flex items-center justify-center text-gold shrink-0">
                  <Home className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Total Properties
                  </span>
                  <span className="text-xl font-bold text-emerald-rich dark:text-gold font-display mt-0.5 block">
                    {analytics?.summary?.totalProperties || 0} Active
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
              {/* Trend Chart (SVG) */}
              <div className="lg:col-span-2 border border-gold/15 p-6 rounded-sm bg-white dark:bg-emerald-deep/40 flex flex-col gap-4">
                <h3 className="font-display text-lg font-bold text-emerald-rich dark:text-luxury-cream border-b border-emerald-rich/5 pb-2">
                  Monthly Revenue Trend (Last 6 Months)
                </h3>

                {trendData.length > 0 ? (
                  <div className="w-full flex justify-center py-2">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full max-w-xl h-auto">
                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                        const y = 10 + ratio * chartHeight;
                        const val = Math.round(maxRevenue * (1 - ratio));
                        return (
                          <g key={idx}>
                            <line
                              x1="55"
                              y1={y}
                              x2={chartWidth - 10}
                              y2={y}
                              stroke="var(--color-gold, #c5a880)"
                              strokeOpacity="0.1"
                              strokeDasharray="4 4"
                            />
                            <text
                              x="45"
                              y={y + 4}
                              textAnchor="end"
                              className="text-[9px] fill-muted-foreground font-semibold"
                            >
                              ₹{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                            </text>
                          </g>
                        );
                      })}

                      {/* Line Paths & Markers */}
                      <path
                        fill="none"
                        stroke="url(#chartGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={trendData
                          .map((d: any, idx: number) => {
                            const x = 70 + idx * ((chartWidth - 90) / Math.max(trendData.length - 1, 1));
                            const y = 10 + (1 - d.revenue / maxRevenue) * chartHeight;
                            return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                          })
                          .join(" ")}
                      />

                      {/* Area Fill */}
                      <path
                        fill="url(#chartArea)"
                        stroke="none"
                        d={
                          trendData
                            .map((d: any, idx: number) => {
                              const x = 70 + idx * ((chartWidth - 90) / Math.max(trendData.length - 1, 1));
                              const y = 10 + (1 - d.revenue / maxRevenue) * chartHeight;
                              return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                            })
                            .join(" ") +
                          ` L ${70 + (trendData.length - 1) * ((chartWidth - 90) / Math.max(trendData.length - 1, 1))} ${chartHeight + 10} L 70 ${chartHeight + 10} Z`
                        }
                      />

                      {/* Markers */}
                      {trendData.map((d: any, idx: number) => {
                        const x = 70 + idx * ((chartWidth - 90) / Math.max(trendData.length - 1, 1));
                        const y = 10 + (1 - d.revenue / maxRevenue) * chartHeight;
                        return (
                          <g key={idx} className="group cursor-pointer">
                            <circle cx={x} cy={y} r="5" className="fill-gold stroke-white dark:stroke-emerald-deep stroke-2" />
                            <circle cx={x} cy={y} r="8" className="fill-gold/20 opacity-0 hover:opacity-100 transition-opacity" />
                            <text
                              x={x}
                              y={y - 10}
                              textAnchor="middle"
                              className="text-[9px] fill-emerald-rich dark:fill-gold font-bold opacity-0 hover:opacity-100 transition-opacity bg-black"
                            >
                              ₹{Math.round(d.revenue / 1000)}k
                            </text>
                            {/* X-axis labels */}
                            <text
                              x={x}
                              y={chartHeight + 30}
                              textAnchor="middle"
                              className="text-[9px] fill-muted-foreground font-semibold uppercase tracking-wider"
                            >
                              {d.month}
                            </text>
                          </g>
                        );
                      })}

                      {/* Gradients definitions */}
                      <defs>
                        <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#c5a880" />
                          <stop offset="100%" stopColor="#aa8855" />
                        </linearGradient>
                        <linearGradient id="chartArea" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#c5a880" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#c5a880" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center border border-dashed border-gold/15 rounded-sm">
                    <p className="text-xs text-muted-foreground font-light">Insufficient billing metrics to build trend.</p>
                  </div>
                )}
              </div>

              {/* Popular destinations list */}
              <div className="border border-gold/15 p-6 rounded-sm bg-white dark:bg-emerald-deep/40 flex flex-col gap-4">
                <h3 className="font-display text-lg font-bold text-emerald-rich dark:text-luxury-cream border-b border-emerald-rich/5 pb-2">
                  Top Destinations
                </h3>

                {analytics?.popularDestinations?.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {analytics.popularDestinations.map((dest: any, idx: number) => {
                      const maxRevenueSeen = Math.max(...analytics.popularDestinations.map((d: any) => d.revenue), 1);
                      return (
                        <div key={idx} className="flex flex-col gap-1 text-xs">
                          <div className="flex justify-between font-semibold">
                            <span className="text-emerald-rich dark:text-luxury-cream">{dest.city}</span>
                            <span className="text-gold">{dest.bookings} Bookings</span>
                          </div>
                          <div className="w-full bg-emerald-rich/5 border border-gold/5 h-2 rounded-full overflow-hidden relative">
                            <div
                              className="bg-gold h-full rounded-full"
                              style={{ width: `${(dest.revenue / maxRevenueSeen) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            Yielded {formatCurrency(dest.revenue)} in billing
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center border border-dashed border-gold/15 rounded-sm">
                    <p className="text-xs text-muted-foreground font-light">No destinations bookings found yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Properties Management */}
        {activeTab === "properties" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gold/10 pb-4">
              <h2 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold uppercase tracking-wider">
                Properties Portfolio ({properties.length})
              </h2>
              <Button variant="luxury" size="sm" className="flex items-center gap-2 h-9 text-xs" onClick={openCreateProperty}>
                <Plus className="h-4 w-4" /> Add Property
              </Button>
            </div>

            {/* Properties table grid */}
            <div className="overflow-x-auto w-full border border-gold/15 rounded-sm shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-emerald-rich/5 dark:bg-emerald-deep/60 text-gold-dark font-bold border-b border-gold/15 uppercase tracking-wider">
                    <th className="p-4">Properties</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Price Per Night</th>
                    <th className="p-4">State</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10 text-emerald-rich/90 dark:text-luxury-cream/90 font-medium">
                  {properties.map((prop) => (
                    <tr key={prop._id} className="hover:bg-emerald-rich/[0.01]">
                      {/* Image + Title */}
                      <td className="p-4 flex items-center gap-3 min-w-[20rem]">
                        <div className="h-10 w-16 bg-luxury-sand rounded-sm overflow-hidden shrink-0 relative border border-gold/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={prop.images[0]} alt={prop.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="truncate">
                          <span className="font-bold block text-sm truncate max-w-xs">{prop.title}</span>
                          <span className="text-[10px] text-muted-foreground block font-mono">ID: {prop._id}</span>
                        </div>
                      </td>

                      <td className="p-4 capitalize">{prop.type}</td>
                      <td className="p-4 truncate max-w-[12rem]">{prop.city}, {prop.country}</td>
                      <td className="p-4 font-bold text-gold">{formatCurrency(prop.pricePerNight)}</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border",
                            prop.status === "published"
                              ? "bg-emerald-400/10 text-emerald-500 border-emerald-500/20"
                              : prop.status === "draft"
                              ? "bg-amber-400/10 text-amber-500 border-amber-500/20"
                              : "bg-red-400/10 text-red-500 border-red-500/20"
                          )}
                        >
                          {prop.status}
                        </span>
                      </td>

                      <td className="p-4 text-right flex items-center justify-end gap-2 h-18">
                        <button
                          onClick={() => openCalendarController(prop)}
                          className="p-2 border border-emerald-500/15 rounded-sm hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors"
                          title="Manage Availability Calendar"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEditProperty(prop)}
                          className="p-2 border border-gold/15 rounded-sm hover:bg-gold/10 text-gold transition-colors"
                          title="Edit property"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(prop._id)}
                          className="p-2 border border-red-500/15 rounded-sm hover:bg-red-500/10 text-red-500 transition-colors"
                          title="Delete property"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Booking Tracker */}
        {activeTab === "bookings" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gold/10 pb-4">
              <h2 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold uppercase tracking-wider">
                Guest Bookings Ledger ({bookings.length})
              </h2>
              <Button variant="luxury" size="sm" className="flex items-center gap-2 h-9 text-xs" onClick={openCreateBooking}>
                <Plus className="h-4 w-4" /> Create Custom Booking
              </Button>
            </div>

            <div className="overflow-x-auto w-full border border-gold/15 rounded-sm shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-emerald-rich/5 dark:bg-emerald-deep/60 text-gold-dark font-bold border-b border-gold/15 uppercase tracking-wider">
                    <th className="p-4">Properties & Guests</th>
                    <th className="p-4">User Contact</th>
                    <th className="p-4">Period / Specs</th>
                    <th className="p-4">Bill Sum</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Receipt UTR</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10 text-emerald-rich/90 dark:text-luxury-cream/90 font-medium">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-emerald-rich/[0.01]">
                      {/* Estate details */}
                      <td className="p-4 min-w-[15rem]">
                        <span className="font-bold text-sm block">{b.property?.title || "Property Deleted"}</span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {b.property ? `${b.property.city}, ${b.property.country}` : ""}
                        </span>
                      </td>

                      {/* User details */}
                      <td className="p-4 min-w-[10rem]">
                        <span className="font-bold block">{b.name || b.user?.name || "Guest Profile Unavailable"}</span>
                        <span className="text-[10px] text-muted-foreground block">{b.email || b.user?.email}</span>
                        {b.user?.phoneNumber && (
                          <span className="text-[10px] text-muted-foreground block mt-0.5">{b.user.phoneNumber}</span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="p-4 min-w-[12rem]">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold">In: {formatDate(b.checkIn)}</span>
                          <span className="font-bold">Out: {formatDate(b.checkOut)}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            {b.guests} Guests staying
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-bold text-gold">{formatCurrency(b.totalPrice)}</td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          {renderStatus(b.status)}
                          {renderPaymentStatus(b.paymentStatus)}
                        </div>
                      </td>

                      {/* UPI Info / Screenshot screenshot thumbnail */}
                      <td className="p-4 min-w-[10rem]">
                        {b.upiTransactionId ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="font-mono bg-emerald-rich/5 border border-gold/15 px-1.5 py-0.5 rounded-sm font-bold text-[10px] uppercase text-emerald-rich dark:text-gold block">
                              UTR: {b.upiTransactionId}
                            </span>
                            {b.upiReceiptScreenshot ? (
                              <button
                                onClick={() => setZoomedImage(b.upiReceiptScreenshot)}
                                className="text-[10px] text-gold hover:text-gold-light flex items-center gap-1 hover:underline mt-0.5 font-bold"
                              >
                                <Eye className="h-3 w-3 shrink-0" /> View Receipt Image
                              </button>
                            ) : (
                              <span className="text-[9px] text-muted-foreground block italic font-light">No screenshot attached</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[9px] text-muted-foreground font-light italic">No payment record</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5 min-w-[8rem]">
                          {b.status === "pending" && (
                            <button
                              onClick={() => handleUpdateBooking(b._id, "confirmed", "paid")}
                              className="px-2 py-1 rounded-sm bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-600/20 hover:bg-emerald-600/20 transition-colors font-bold text-[9px] uppercase tracking-wider"
                              title="Confirm booking & notify guest"
                            >
                              Confirm Booking
                            </button>
                          )}

                          {["pending", "confirmed"].includes(b.status) && (
                            <button
                              onClick={() => handleUpdateBooking(b._id, "cancelled", b.paymentStatus === "paid" ? "refunded" : undefined)}
                              className="px-2 py-1 rounded-sm bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors font-bold text-[9px] uppercase tracking-wider"
                              title="Cancel & mark refund"
                            >
                              Cancel Stay
                            </button>
                          )}

                          {b.status === "confirmed" && (
                            <button
                              onClick={() => handleUpdateBooking(b._id, "completed")}
                              className="px-2 py-1 rounded-sm bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-colors font-bold text-[9px] uppercase tracking-wider"
                              title="Mark checkout done"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: User Accounts controller */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold border-b border-gold/10 pb-4 uppercase tracking-wider">
              System Profiles Ledger ({users.length})
            </h2>

            <div className="overflow-x-auto w-full border border-gold/15 rounded-sm shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-emerald-rich/5 dark:bg-emerald-deep/60 text-gold-dark font-bold border-b border-gold/15 uppercase tracking-wider">
                    <th className="p-4">Traveller / Agent Profile</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">System Role</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4">Blocked</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10 text-emerald-rich/90 dark:text-luxury-cream/90 font-medium">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-emerald-rich/[0.01]">
                      {/* Name + Avatar */}
                      <td className="p-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full border border-gold/30 bg-emerald-accent flex items-center justify-center text-gold font-bold text-xs shrink-0 overflow-hidden">
                          {u.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                          ) : (
                            u.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <span className="font-bold block text-sm">{u.name}</span>
                          <span className="text-[10px] text-muted-foreground block font-mono">UID: {u._id}</span>
                        </div>
                      </td>

                      {/* Contact details */}
                      <td className="p-4">
                        <span className="block">{u.email}</span>
                        {u.phoneNumber && <span className="text-muted-foreground block text-[10px] mt-0.5">{u.phoneNumber}</span>}
                      </td>

                      {/* System Role */}
                      <td className="p-4 capitalize">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase border",
                            u.role === "admin"
                              ? "bg-gold/15 text-gold border-gold/35"
                              : u.role === "agent"
                              ? "bg-blue-400/10 text-blue-500 border-blue-500/20"
                              : "bg-emerald-400/10 text-emerald-500 border-emerald-500/20"
                          )}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="p-4">{formatDate(u.createdAt)}</td>

                      {/* Blocked state badge */}
                      <td className="p-4 font-bold">
                        {u.isBlocked ? (
                          <span className="text-red-500 uppercase tracking-wider font-bold text-[10px] inline-flex items-center gap-1">
                            <XCircle className="h-3.5 w-3.5" /> Suspended
                          </span>
                        ) : (
                          <span className="text-emerald-500 uppercase tracking-wider font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> Active
                          </span>
                        )}
                      </td>

                      {/* Action block/unblock toggler */}
                      <td className="p-4 text-right">
                        {u.role !== "admin" ? (
                          <button
                            onClick={() => handleToggleUserBlock(u._id, u.isBlocked)}
                            className={cn(
                              "px-3 py-1.5 rounded-sm font-bold text-[10px] uppercase border transition-colors",
                              u.isBlocked
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                            )}
                          >
                            {u.isBlocked ? (
                              <span className="flex items-center gap-1 justify-center">
                                <UserCheck className="h-3.5 w-3.5" /> Activate
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 justify-center">
                                <UserX className="h-3.5 w-3.5" /> Suspend
                              </span>
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-light italic">System Owner</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Content Editor */}
        {activeTab === "content" && (
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-2xl font-bold text-emerald-rich dark:text-gold uppercase tracking-wider">
              Content & Layout Editor
            </h2>

            {/* Sub-tab menu links */}
            <div className="flex flex-wrap gap-4 border-b border-gold/10 pb-1">
              <button
                onClick={() => setContentSubTab("destinations")}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors",
                  contentSubTab === "destinations"
                    ? "border-gold text-gold"
                    : "border-transparent text-muted-foreground hover:text-emerald-rich dark:hover:text-luxury-cream"
                )}
              >
                Destinations
              </button>
              <button
                onClick={() => setContentSubTab("packages")}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors",
                  contentSubTab === "packages"
                    ? "border-gold text-gold"
                    : "border-transparent text-muted-foreground hover:text-emerald-rich dark:hover:text-luxury-cream"
                )}
              >
                Tour Packages
              </button>
              <button
                onClick={() => setContentSubTab("banners")}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors",
                  contentSubTab === "banners"
                    ? "border-gold text-gold"
                    : "border-transparent text-muted-foreground hover:text-emerald-rich dark:hover:text-luxury-cream"
                )}
              >
                Hero Slides Banners
              </button>
            </div>

            {/* Sub-tab 1: Destinations */}
            {contentSubTab === "destinations" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Featured Destinations
                  </h3>
                  <Button variant="luxury" size="sm" className="h-8 text-[10px] px-3 font-bold" onClick={openCreateDest}>
                    <Plus className="h-3 w-3 mr-1" /> Add Destination
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {destinations.map((d) => (
                    <div key={d._id} className="border border-gold/15 rounded-sm overflow-hidden flex flex-col justify-between bg-emerald-rich/5">
                      <div className="h-36 bg-luxury-sand relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={d.image} alt={d.name} className="h-full w-full object-cover" />
                        {d.isFeatured && (
                          <span className="absolute top-2 left-2 bg-gold text-emerald-deep font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-grow text-left">
                        <span className="font-display font-bold text-lg text-emerald-rich dark:text-luxury-cream block">
                          {d.name}
                        </span>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                          {d.description}
                        </p>
                      </div>
                      <div className="p-3 border-t border-gold/10 bg-white dark:bg-emerald-deep/40 flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDest(d)}
                          className="p-1.5 border border-gold/15 text-gold rounded-sm hover:bg-gold/10"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDest(d._id)}
                          className="p-1.5 border border-red-500/15 text-red-500 rounded-sm hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 2: Tour Packages */}
            {contentSubTab === "packages" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Elite Tour Packages & Experiences
                  </h3>
                  <Button variant="luxury" size="sm" className="h-8 text-[10px] px-3 font-bold" onClick={openCreatePackage}>
                    <Plus className="h-3 w-3 mr-1" /> Add Tour Package
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packages.map((p) => (
                    <div key={p._id} className="border border-gold/15 rounded-sm overflow-hidden flex flex-col justify-between bg-emerald-rich/5">
                      <div className="h-36 bg-luxury-sand relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                        {p.isFeatured && (
                          <span className="absolute top-2 left-2 bg-gold text-emerald-deep font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm">
                            Featured
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 bg-emerald-deep/80 text-gold font-bold text-[10px] px-2 py-0.5 rounded-sm border border-gold/20">
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                      <div className="p-4 flex-grow text-left flex flex-col gap-1">
                        <span className="font-display font-bold text-lg text-emerald-rich dark:text-luxury-cream truncate block">
                          {p.title}
                        </span>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold">
                          <span>📍 {p.location}</span>
                          <span>⏱️ {p.duration}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed font-light">
                          {p.description}
                        </p>
                      </div>
                      <div className="p-3 border-t border-gold/10 bg-white dark:bg-emerald-deep/40 flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditPackage(p)}
                          className="p-1.5 border border-gold/15 text-gold rounded-sm hover:bg-gold/10"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(p._id)}
                          className="p-1.5 border border-red-500/15 text-red-500 rounded-sm hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 3: Hero Banners */}
            {contentSubTab === "banners" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Layout Banners List
                  </h3>
                  <Button variant="luxury" size="sm" className="h-8 text-[10px] px-3 font-bold" onClick={openCreateBanner}>
                    <Plus className="h-3 w-3 mr-1" /> Add Hero Slide
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {banners.map((b) => (
                    <div key={b._id} className="border border-gold/15 rounded-sm overflow-hidden flex flex-col justify-between bg-emerald-rich/5">
                      <div className="h-40 bg-luxury-sand relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/45 flex flex-col justify-end p-4 text-left">
                          <span className="font-display text-lg font-bold text-white leading-tight">
                            {b.title}
                          </span>
                          <span className="text-xs text-white/70 truncate block">{b.subtitle}</span>
                        </div>
                        <span className="absolute top-2 left-2 bg-emerald-deep text-gold border border-gold/20 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                          Order: {b.order}
                        </span>
                        <span
                          className={cn(
                            "absolute top-2 right-2 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm",
                            b.isActive ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                          )}
                        >
                          {b.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="p-3 border-t border-gold/10 bg-white dark:bg-emerald-deep/40 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-mono truncate max-w-xs">Link: {b.link}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditBanner(b)}
                            className="p-1.5 border border-gold/15 text-gold rounded-sm hover:bg-gold/10"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(b._id)}
                            className="p-1.5 border border-red-500/15 text-red-500 rounded-sm hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        )}

        {/* Tab 6: Blogs Management */}
        {activeTab === "blogs" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-gold/10 pb-4">
              <div>
                <h2 className="font-display text-2xl text-emerald-rich dark:text-luxury-cream">Blogs & Articles</h2>
                <p className="text-xs text-muted-foreground mt-1">Manage and publish news, tour updates, or travel tips.</p>
              </div>
              <Button variant="luxury" size="sm" onClick={openCreateBlog}>
                <Plus className="h-4 w-4 mr-2" /> Write Article
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map((b) => (
                <div key={b._id} className="border border-gold/15 rounded-sm p-4 bg-emerald-rich/[0.01] flex flex-col justify-between">
                  <div className="flex gap-4">
                    <div className="h-20 w-28 rounded-sm overflow-hidden shrink-0 bg-luxury-sand relative border border-gold/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.coverImage} alt={b.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-1 text-left min-w-0">
                      <span className="font-display font-semibold text-emerald-rich dark:text-luxury-cream truncate block text-sm">{b.title}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">By {b.author || "Stayora"} | {(b.tags || []).join(", ")}</span>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{b.excerpt}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gold/5">
                    <button
                      onClick={() => openEditBlog(b)}
                      className="p-1.5 border border-gold/15 text-gold rounded-sm hover:bg-gold/10 text-xs flex items-center gap-1 font-semibold"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(b._id)}
                      className="p-1.5 border border-red-500/15 text-red-500 rounded-sm hover:bg-red-500/10 text-xs flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE / EDIT PROPERTY - Transformed with Concierge Professional Language */}
      <Modal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        title={editingPropertyId ? "Edit Exclusive Property Profile" : "Initiate Elite Retreat Listing"}
      >
        <form onSubmit={handlePropertySubmit} className="flex flex-col gap-4 text-left">
          {propertyError && <span className="text-xs text-red-500 font-bold">{propertyError}</span>}

          <Input
            id="property-title-input"
            label="Exclusive Property Title"
            type="text"
            required
            placeholder="e.g. The Grand Horizon Sanctuary"
            value={propertyForm.title}
            onChange={(e) => setPropertyForm((prev) => ({ ...prev, title: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="property-type" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
                Property Type & Classification
              </label>
              <select
                id="property-type"
                className="w-full px-4 h-11 border border-gold/15 bg-white dark:bg-emerald-accent/20 rounded-sm text-sm focus:border-gold outline-none"
                value={propertyForm.type}
                onChange={(e) => setPropertyForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="villa">Villa</option>
                <option value="hotel">Boutique Hotel</option>
                <option value="resort">Resort</option>
                <option value="apartment">Elite Apartment</option>
                <option value="cabin">Rustic Cabin</option>
                <option value="mansion">Mansion</option>
                <option value="hostel">Boutique Hostel</option>
                <option value="guesthouse">Heritage Guest House</option>
                <option value="lodge">Lodge</option>
                <option value="spa">Wellness Spa & Health Center</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="property-status" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
                Inventory Publish Status
              </label>
              <select
                id="property-status"
                className="w-full px-4 h-11 border border-gold/15 bg-white dark:bg-emerald-accent/20 rounded-sm text-sm focus:border-gold outline-none"
                value={propertyForm.status}
                onChange={(e) => setPropertyForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="draft">Review / Draft State</option>
                <option value="published">Active / Published State</option>
                <option value="archived">Retired / Archived State</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="property-destination" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Connected Destination (Link to Location)
            </label>
            <select
              id="property-destination"
              className="w-full px-4 h-11 border border-gold/15 bg-white dark:bg-emerald-accent/20 rounded-sm text-sm focus:border-gold outline-none text-emerald-rich dark:text-luxury-cream"
              value={propertyForm.destination}
              onChange={(e) => setPropertyForm((prev) => ({ ...prev, destination: e.target.value }))}
            >
              <option value="">No Explicit Destination connected</option>
              {destinations.map((dest: any) => (
                <option key={dest._id} value={dest._id}>
                  {dest.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="estate-price"
              label="Bespoke Fare Rate per Night (₹ INR)"
              type="number"
              required
              min="0"
              placeholder="e.g. 15000"
              value={propertyForm.pricePerNight}
              onChange={(e) => setPropertyForm((prev) => ({ ...prev, pricePerNight: e.target.value }))}
            />
            <Input
              id="estate-maxguests"
              label="Maximum Guest Occupancy Limit"
              type="number"
              required
              min="1"
              placeholder="e.g. 6"
              value={propertyForm.maxGuests}
              onChange={(e) => setPropertyForm((prev) => ({ ...prev, maxGuests: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="estate-bedrooms"
              label="Bedrooms Capacity"
              type="number"
              required
              min="0"
              value={propertyForm.bedrooms}
              onChange={(e) => setPropertyForm((prev) => ({ ...prev, bedrooms: e.target.value }))}
            />
            <Input
              id="estate-bathrooms"
              label="Bathrooms Capacity"
              type="number"
              required
              min="0"
              value={propertyForm.bathrooms}
              onChange={(e) => setPropertyForm((prev) => ({ ...prev, bathrooms: e.target.value }))}
            />
          </div>

          <Input
            id="estate-address"
            label="Street Location Details"
            type="text"
            required
            placeholder="e.g. 12 Cliffside Dr, near Lighthouse"
            value={propertyForm.address}
            onChange={(e) => setPropertyForm((prev) => ({ ...prev, address: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="estate-city"
              label="City"
              type="text"
              required
              value={propertyForm.city}
              onChange={(e) => setPropertyForm((prev) => ({ ...prev, city: e.target.value }))}
            />
            <Input
              id="estate-country"
              label="Country"
              type="text"
              required
              value={propertyForm.country}
              onChange={(e) => setPropertyForm((prev) => ({ ...prev, country: e.target.value }))}
            />
          </div>

          <Input
            id="estate-amenities"
            label="Luxury Amenities & Inclusions (comma separated)"
            type="text"
            placeholder="e.g. Infinity Pool, Private Chef, Heliport, Steam Room"
            value={propertyForm.amenities}
            onChange={(e) => setPropertyForm((prev) => ({ ...prev, amenities: e.target.value }))}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="estate-description" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Bespoke Estate Description
            </label>
            <textarea
              id="estate-description"
              required
              rows={4}
              placeholder="Detail the location benefits, history, views, and exclusive services of the estate..."
              className="w-full p-4 border border-gold/15 bg-white dark:bg-emerald-accent/20 rounded-sm text-sm focus:border-gold outline-none text-emerald-rich dark:text-luxury-cream"
              value={propertyForm.description}
              onChange={(e) => setPropertyForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <Input
            id="estate-rules"
            label="House Rules & Guidelines (comma separated key:value or sentences)"
            type="text"
            placeholder="e.g. CHECK-IN TIME: 02:00 PM, NO PETS: Allowed on the property"
            value={propertyForm.rules}
            onChange={(e) => setPropertyForm((prev) => ({ ...prev, rules: e.target.value }))}
          />

          {/* Image Upload Gallery */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Select High-Res Promotional Photos
            </span>
            <div className="grid grid-cols-4 gap-3">
              {propertyForm.images.map((img, idx) => (
                <div key={idx} className="h-16 rounded-sm overflow-hidden relative border border-gold/10 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setPropertyForm((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== idx)
                      }))
                    }
                    className="absolute inset-0 bg-red-500/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold uppercase transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <label className="h-16 border border-dashed border-emerald-rich/20 rounded-sm flex flex-col items-center justify-center hover:bg-emerald-rich/5 cursor-pointer bg-emerald-rich/[0.01]">
                <Plus className="h-5 w-5 text-gold" />
                <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5">Upload</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handlePropertyImagesChange} />
              </label>
            </div>
          </div>

          <Button type="submit" variant="luxury" size="md" className="mt-4 self-end" isLoading={isSavingProperty}>
            {editingPropertyId ? "Commit Changes" : "Publish Estate Listing"}
          </Button>
        </form>
      </Modal>

      {/* MODAL 2: CREATE / EDIT DESTINATION */}
      <Modal
        isOpen={isDestModalOpen}
        onClose={() => setIsDestModalOpen(false)}
        title={editingDestId ? "Edit Destination Profile" : "Register Luxury Destination"}
      >
        <form onSubmit={handleDestSubmit} className="flex flex-col gap-4 text-left">
          <Input
            id="dest-name"
            label="Destination City / Location Name"
            type="text"
            required
            placeholder="e.g. Amalfi Coast"
            value={destForm.name}
            onChange={(e) => setDestForm((prev) => ({ ...prev, name: e.target.value }))}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="dest-description" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Destination Location Summary
            </label>
            <textarea
              id="dest-description"
              required
              rows={3}
              placeholder="Describe the aesthetic, local attractions, and geographical beauty..."
              className="w-full p-4 border border-gold/15 bg-white dark:bg-emerald-accent/20 rounded-sm text-sm focus:border-gold outline-none text-emerald-rich dark:text-luxury-cream"
              value={destForm.description}
              onChange={(e) => setDestForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Photo upload */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Select Cover Promotional Image
            </span>
            {destForm.image && (
              <div className="h-28 w-44 rounded-sm overflow-hidden border border-gold/15 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={destForm.image} alt="preview" className="h-full w-full object-cover" />
              </div>
            )}
            <label className="flex items-center gap-2 border border-dashed border-emerald-rich/20 rounded-sm p-4 bg-emerald-rich/[0.01] cursor-pointer hover:bg-emerald-rich/5">
              <Upload className="h-4 w-4 text-gold" />
              <span className="text-xs text-muted-foreground">Select Cover Photo (JPEG/PNG)</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageChange(e, setDestForm)} />
            </label>
          </div>

          {/* Popular Spots and Activities editor */}
          <div className="border-t border-gold/15 pt-4 mt-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
                Popular Spots & Excursion Activities
              </span>
              <button
                type="button"
                onClick={addPopularSpot}
                className="px-3 py-1 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-sm text-[10px] uppercase font-bold tracking-wider"
              >
                + Add Popular Spot
              </button>
            </div>

            <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-1">
              {(destForm.popularSpots || []).map((spot, idx) => (
                <div key={idx} className="p-3 border border-gold/10 rounded-sm bg-emerald-rich/[0.01] flex flex-col gap-3 relative">
                  <button
                    type="button"
                    onClick={() => removePopularSpot(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-600 font-bold text-xs uppercase"
                  >
                    Remove
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id={`spot-name-${idx}`}
                      label="Spot Name"
                      type="text"
                      required
                      placeholder="e.g. Blue Grotto"
                      value={spot.name}
                      onChange={(e) => updatePopularSpotField(idx, "name", e.target.value)}
                    />
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
                        Spot Cover Photo
                      </label>
                      <div className="flex items-center gap-2">
                        {spot.image && (
                          <div className="h-10 w-16 bg-luxury-sand rounded-sm overflow-hidden border border-gold/10 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={spot.image} alt="spot preview" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <label className="flex items-center justify-center gap-1.5 border border-dashed border-emerald-rich/20 rounded-sm px-3 h-10 bg-emerald-rich/[0.01] cursor-pointer hover:bg-emerald-rich/5 flex-1">
                          <Upload className="h-3.5 w-3.5 text-gold" />
                          <span className="text-[10px] text-muted-foreground">Select Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSpotImageChange(e, idx)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <Input
                    id={`spot-activities-${idx}`}
                    label="Activities (comma separated)"
                    type="text"
                    placeholder="e.g. Boating, Swimming, Cave exploring"
                    value={(spot.activities || []).join(", ")}
                    onChange={(e) =>
                      updatePopularSpotField(
                        idx,
                        "activities",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="dest-featured"
              checked={destForm.isFeatured}
              onChange={(e) => setDestForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
              className="h-4 w-4 rounded-sm border-gold/20"
            />
            <label htmlFor="dest-featured" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-luxury-cream">
              Feature on Homepage slider
            </label>
          </div>

          <Button type="submit" variant="luxury" size="md" className="mt-4 self-end" isLoading={isSavingDest}>
            {editingDestId ? "Commit Changes" : "Register Destination"}
          </Button>
        </form>
      </Modal>

      {/* MODAL 3: CREATE / EDIT TOUR PACKAGE */}
      <Modal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        title={editingPackageId ? "Edit Bespoke Tour Itinerary" : "Configure New Travel Excursion"}
      >
        <form onSubmit={handlePackageSubmit} className="flex flex-col gap-4 text-left">
          <Input
            id="pack-title"
            label="Bespoke Excursion Title"
            type="text"
            required
            placeholder="e.g. Private Yacht Charter & Shore Dining"
            value={packageForm.title}
            onChange={(e) => setPackageForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <Input
            id="pack-location"
            label="Excursion Location / Coordinates"
            type="text"
            required
            placeholder="e.g. Amalfi Coast / Positano, Italy"
            value={packageForm.location}
            onChange={(e) => setPackageForm((prev) => ({ ...prev, location: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="pack-price"
              label="Package Cost / Pricing (₹ INR)"
              type="number"
              required
              placeholder="e.g. 45000"
              value={packageForm.price}
              onChange={(e) => setPackageForm((prev) => ({ ...prev, price: e.target.value }))}
            />
            <Input
              id="pack-duration"
              label="Trip Excursion Duration"
              type="text"
              required
              placeholder="e.g. 8 Hours / Day Tour"
              value={packageForm.duration}
              onChange={(e) => setPackageForm((prev) => ({ ...prev, duration: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="pack-description" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Luxury Tour Description
            </label>
            <textarea
              id="pack-description"
              required
              rows={3}
              placeholder="Describe the package inclusions, trip itinerary, host assistance details..."
              className="w-full p-4 border border-gold/15 bg-white dark:bg-emerald-accent/20 rounded-sm text-sm focus:border-gold outline-none text-emerald-rich dark:text-luxury-cream"
              value={packageForm.description}
              onChange={(e) => setPackageForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Photo upload */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Select Excursion Promotional Image
            </span>
            {packageForm.image && (
              <div className="h-28 w-44 rounded-sm overflow-hidden border border-gold/15 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={packageForm.image} alt="preview" className="h-full w-full object-cover" />
              </div>
            )}
            <label className="flex items-center gap-2 border border-dashed border-emerald-rich/20 rounded-sm p-4 bg-emerald-rich/[0.01] cursor-pointer hover:bg-emerald-rich/5">
              <Upload className="h-4 w-4 text-gold" />
              <span className="text-xs text-muted-foreground">Select Excursion Photo (JPEG/PNG)</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageChange(e, setPackageForm)} />
            </label>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="pack-featured"
              checked={packageForm.isFeatured}
              onChange={(e) => setPackageForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
              className="h-4 w-4 rounded-sm border-gold/20"
            />
            <label htmlFor="pack-featured" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-luxury-cream">
              Feature on Experiences page
            </label>
          </div>

          <Button type="submit" variant="luxury" size="md" className="mt-4 self-end" isLoading={isSavingPackage}>
            {editingPackageId ? "Commit Changes" : "Launch Tour Package"}
          </Button>
        </form>
      </Modal>

      {/* MODAL 4: CREATE / EDIT HERO BANNER */}
      <Modal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        title={editingBannerId ? "Edit Hero Slide Banner" : "Configure Hero Slide Banner"}
      >
        <form onSubmit={handleBannerSubmit} className="flex flex-col gap-4 text-left">
          <Input
            id="banner-title"
            label="Banner Primary Heading"
            type="text"
            required
            placeholder="e.g. Refining the Art of Luxury Stays"
            value={bannerForm.title}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <Input
            id="banner-subtitle"
            label="Secondary Sub-Heading / Caption"
            type="text"
            placeholder="e.g. Discover private estates curated for discerning travelers..."
            value={bannerForm.subtitle}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, subtitle: e.target.value }))}
          />
          <Input
            id="banner-link"
            label="Redirect URL Redirect Link"
            type="text"
            placeholder="/stays"
            value={bannerForm.link}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, link: e.target.value }))}
          />
          <Input
            id="banner-order"
            label="Slide Ordering Rank Position"
            type="number"
            value={bannerForm.order}
            onChange={(e) => setBannerForm((prev) => ({ ...prev, order: e.target.value }))}
          />

          {/* Photo upload */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Select Slide Background Image
            </span>
            {bannerForm.image && (
              <div className="h-28 w-52 rounded-sm overflow-hidden border border-gold/15 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bannerForm.image} alt="preview" className="h-full w-full object-cover" />
              </div>
            )}
            <label className="flex items-center gap-2 border border-dashed border-emerald-rich/20 rounded-sm p-4 bg-emerald-rich/[0.01] cursor-pointer hover:bg-emerald-rich/5">
              <Upload className="h-4 w-4 text-gold" />
              <span className="text-xs text-muted-foreground">Select Slide Background Photo (JPEG/PNG)</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSingleImageChange(e, setBannerForm)} />
            </label>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="banner-active"
              checked={bannerForm.isActive}
              onChange={(e) => setBannerForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 rounded-sm border-gold/20"
            />
            <label htmlFor="banner-active" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-luxury-cream">
              Set active on homepage slider
            </label>
          </div>

          <Button type="submit" variant="luxury" size="md" className="mt-4 self-end" isLoading={isSavingBanner}>
            {editingBannerId ? "Commit Changes" : "Register Hero Slide"}
          </Button>
        </form>
      </Modal>

      {/* MODAL 5: IMAGE ZOOM MODAL */}
      <Modal isOpen={!!zoomedImage} onClose={() => setZoomedImage(null)} title="Transaction Receipt Screenshot Preview">
        <div className="max-w-2xl max-h-[80vh] flex items-center justify-center p-2">
          {zoomedImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={zoomedImage} alt="UTR Screenshot Receipt" className="max-w-full max-h-[70vh] object-contain rounded-sm border border-gold/20 shadow-lg" />
          )}
        </div>
      </Modal>

      {/* MODAL 6: CREATE CUSTOM BOOKING */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Create Custom Booking & Confirm Reservation"
      >
        <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4 text-left">
          {bookingFormError && <span className="text-xs text-red-500 font-bold">{bookingFormError}</span>}

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="booking-property" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Selected Property
            </label>
            <select
              id="booking-property"
              className="w-full px-4 h-11 border border-gold/15 bg-white dark:bg-emerald-accent/20 rounded-sm text-sm focus:border-gold outline-none text-emerald-rich dark:text-luxury-cream"
              value={bookingForm.propertyId}
              onChange={(e) => {
                const propId = e.target.value;
                const targetProp = properties.find((p: any) => p._id === propId);
                setBookingForm((prev) => ({
                  ...prev,
                  propertyId: propId,
                  totalPrice: targetProp ? targetProp.pricePerNight.toString() : "",
                }));
              }}
              required
            >
              <option value="">Select property...</option>
              {properties.map((prop: any) => (
                <option key={prop._id} value={prop._id}>
                  {prop.title} (₹{prop.pricePerNight}/night)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="booking-name"
              label="Guest Full Name"
              type="text"
              required
              placeholder="e.g. John Doe"
              value={bookingForm.name}
              onChange={(e) => setBookingForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              id="booking-email"
              label="Guest Email Address"
              type="email"
              required
              placeholder="e.g. john@example.com"
              value={bookingForm.email}
              onChange={(e) => setBookingForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <Input
            id="booking-phone"
            label="Guest Contact Number"
            type="tel"
            required
            placeholder="e.g. +91 98765 43210"
            value={bookingForm.phoneNumber}
            onChange={(e) => setBookingForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="booking-checkin" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
                Check-In Date
              </label>
              <input
                id="booking-checkin"
                type="date"
                required
                className="w-full px-4 h-11 border border-gold/15 bg-white dark:bg-emerald-accent/20 rounded-sm text-sm focus:border-gold outline-none text-emerald-rich dark:text-luxury-cream cursor-pointer"
                value={bookingForm.checkIn}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, checkIn: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="booking-checkout" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
                Check-Out Date
              </label>
              <input
                id="booking-checkout"
                type="date"
                required
                className="w-full px-4 h-11 border border-gold/15 bg-white dark:bg-emerald-accent/20 rounded-sm text-sm focus:border-gold outline-none text-emerald-rich dark:text-luxury-cream cursor-pointer"
                value={bookingForm.checkOut}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, checkOut: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              id="booking-guests"
              label="Total Guests Count"
              type="number"
              required
              min="1"
              value={bookingForm.guests}
              onChange={(e) => setBookingForm((prev) => ({ ...prev, guests: e.target.value }))}
            />
            <Input
              id="booking-price"
              label="Agreed Total Cost (₹ INR)"
              type="number"
              required
              min="0"
              value={bookingForm.totalPrice}
              onChange={(e) => setBookingForm((prev) => ({ ...prev, totalPrice: e.target.value }))}
            />
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="booking-status" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
                Booking Status
              </label>
              <select
                id="booking-status"
                className="w-full px-4 h-11 border border-gold/15 bg-white dark:bg-emerald-accent/20 rounded-sm text-sm focus:border-gold outline-none text-emerald-rich dark:text-luxury-cream"
                value={bookingForm.status}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="pending">Pending Enquiry</option>
                <option value="confirmed">Confirmed (Triggers Email & PDF)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gold/10 pt-4 mt-2">
            <Input
              id="booking-custom-amenities"
              label="Custom Amenities for this booking (comma separated)"
              type="text"
              placeholder="e.g. Private Pool Access, Bonfire Kit, Guided Trek"
              value={bookingForm.customAmenities}
              onChange={(e) => setBookingForm((prev) => ({ ...prev, customAmenities: e.target.value }))}
            />
            <Input
              id="booking-custom-rules"
              label="Custom Rules for this booking (comma separated)"
              type="text"
              placeholder="e.g. Check-in: 1:00 PM, No smoking inside rooms"
              value={bookingForm.customRules}
              onChange={(e) => setBookingForm((prev) => ({ ...prev, customRules: e.target.value }))}
            />
          </div>

          <Button type="submit" variant="luxury" size="md" className="mt-4 self-end" isLoading={isSavingBooking}>
            Create & Save Booking
          </Button>
        </form>
      </Modal>

      {/* MODAL 7: CREATE / EDIT BLOG POST */}
      <Modal
        isOpen={isBlogModalOpen}
        onClose={() => setIsBlogModalOpen(false)}
        title={editingBlogId ? "Edit Blog Article" : "Create New Blog Article"}
      >
        <form onSubmit={handleBlogSubmit} className="flex flex-col gap-4 text-left">
          <Input
            id="blog-title"
            label="Article Title"
            type="text"
            required
            placeholder="e.g. Secrets of the Western Ghats Trails"
            value={blogForm.title}
            onChange={(e) => setBlogForm((prev) => ({ ...prev, title: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="blog-author"
              label="Author Name"
              type="text"
              placeholder="e.g. Stayora Explorer"
              value={blogForm.author}
              onChange={(e) => setBlogForm((prev) => ({ ...prev, author: e.target.value }))}
            />
            <Input
              id="blog-tags"
              label="Tags (comma separated)"
              type="text"
              placeholder="e.g. Western Ghats, Trekking, Tourism"
              value={blogForm.tags}
              onChange={(e) => setBlogForm((prev) => ({ ...prev, tags: e.target.value }))}
            />
          </div>

          <Input
            id="blog-cover"
            label="Cover Image URL"
            type="text"
            required
            placeholder="e.g. https://images.unsplash.com/..."
            value={blogForm.coverImage}
            onChange={(e) => setBlogForm((prev) => ({ ...prev, coverImage: e.target.value }))}
          />

          <Input
            id="blog-excerpt"
            label="Short Excerpt"
            type="text"
            required
            placeholder="Brief summary of the article..."
            value={blogForm.excerpt}
            onChange={(e) => setBlogForm((prev) => ({ ...prev, excerpt: e.target.value }))}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="blog-content" className="text-xs font-semibold uppercase tracking-wider text-emerald-rich dark:text-gold-subtle">
              Article Content (Supports markdown style paragraphs)
            </label>
            <textarea
              id="blog-content"
              required
              rows={8}
              placeholder="Write the full body of the article here..."
              className="w-full p-4 border border-gold/15 bg-white dark:bg-emerald-accent/20 rounded-sm text-sm focus:border-gold outline-none text-emerald-rich dark:text-luxury-cream"
              value={blogForm.content}
              onChange={(e) => setBlogForm((prev) => ({ ...prev, content: e.target.value }))}
            />
          </div>

          <Button type="submit" variant="luxury" size="md" className="mt-4 self-end" isLoading={isSavingBlog}>
            {editingBlogId ? "Save Article" : "Publish Article"}
          </Button>
        </form>
      </Modal>

      {/* MODAL 8: AVAILABILITY CALENDAR MODAL */}
      <Modal
        isOpen={isCalModalOpen}
        onClose={() => setIsCalModalOpen(false)}
        title={`Calendar - ${calProperty?.title || "Manage Availability"}`}
      >
        <div className="flex flex-col gap-4 text-left font-sans">
          <p className="text-xs text-muted-foreground font-light leading-relaxed">
            Click on any day grid cell to toggle its blocked availability status. Dark red indicates a date is blocked (unavailable for guest bookings). Save changes when done.
          </p>

          {/* Month Navigator */}
          <div className="flex items-center justify-between border-b border-gold/15 pb-3">
            <button
              onClick={() => {
                if (calMonth === 0) {
                  setCalMonth(11);
                  setCalYear((y) => y - 1);
                } else {
                  setCalMonth((m) => m - 1);
                }
              }}
              className="px-3 py-1.5 border border-gold/20 text-gold rounded-sm hover:bg-gold/10 text-xs font-bold transition-colors"
            >
              &larr; Prev
            </button>
            <span className="font-display font-bold text-emerald-rich dark:text-gold text-sm uppercase tracking-wider">
              {calProperty ? [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ][calMonth] : ""} {calYear}
            </span>
            <button
              onClick={() => {
                if (calMonth === 11) {
                  setCalMonth(0);
                  setCalYear((y) => y + 1);
                } else {
                  setCalMonth((m) => m + 1);
                }
              }}
              className="px-3 py-1.5 border border-gold/20 text-gold rounded-sm hover:bg-gold/10 text-xs font-bold transition-colors"
            >
              Next &rarr;
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-gold/10 pb-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Grid cells */}
          <div className="grid grid-cols-7 gap-2">
            {calProperty && (() => {
              const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
              const firstDay = new Date(calYear, calMonth, 1).getDay();
              
              const gridCells = [];
              for (let i = 0; i < firstDay; i++) {
                gridCells.push(<div key={`empty-${i}`} className="h-10 bg-transparent" />);
              }

              for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isBlocked = calBlockedDates.includes(dateStr);

                gridCells.push(
                  <button
                    key={`day-${day}`}
                    onClick={() => handleToggleCalDate(dateStr)}
                    className={cn(
                      "h-10 text-xs font-bold rounded-sm border flex flex-col items-center justify-center transition-colors cursor-pointer",
                      isBlocked
                        ? "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20"
                        : "bg-emerald-500/5 text-emerald-rich dark:text-luxury-cream border-emerald-500/20 hover:bg-emerald-500/15"
                    )}
                  >
                    <span>{day}</span>
                    <span className="text-[7px] font-semibold uppercase tracking-wider scale-90">
                      {isBlocked ? "Blocked" : "Avail"}
                    </span>
                  </button>
                );
              }
              return gridCells;
            })()}
          </div>

          {/* Legend and Save actions */}
          <div className="flex items-center justify-between border-t border-gold/15 pt-4 mt-2">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1.5 text-red-500">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Blocked Date
              </span>
            </div>
            <Button
              onClick={handleSaveCalendar}
              variant="luxury"
              size="sm"
              isLoading={isSavingCal}
              className="h-9 px-6 text-xs"
            >
              Save Calendar Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminClient;
