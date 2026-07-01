import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Property from "@/models/Property";
import Destination from "@/models/Destination";
import Review from "@/models/Review";
import HeroBanner from "@/models/HeroBanner";
import Booking from "@/models/Booking";
import TourPackage from "@/models/TourPackage";
import { ApiResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Clear existing collections
    await User.deleteMany({});
    await Property.deleteMany({});
    await Destination.deleteMany({});
    await Review.deleteMany({});
    await HeroBanner.deleteMany({});
    await Booking.deleteMany({});
    await TourPackage.deleteMany({});

    console.log("🧹 Database cleared");

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("stayora123", salt);

    const adminUser = await User.create({
      name: "Victoria Sterling",
      email: "admin@stayora.com",
      password: hashedPassword,
      role: "admin",
      phoneNumber: "+1 (555) 019-9000",
      isVerified: true,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    });

    const agentUser = await User.create({
      name: "Marcus Aurelius Stays",
      email: "agent@stayora.com",
      password: hashedPassword,
      role: "agent",
      phoneNumber: "+1 (555) 019-8000",
      isVerified: true,
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80",
    });

    const travelerUser = await User.create({
      name: "Alexander Mercer",
      email: "user@stayora.com",
      password: hashedPassword,
      role: "user",
      phoneNumber: "+1 (555) 019-7000",
      isVerified: true,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    });

    console.log("👥 Users seeded");

    // 2. Create Destinations
    const destinationsData = [
      {
        name: "French Riviera",
        slug: "french-riviera",
        description: "The sun-drenched coastline of southeastern France, famous for glamorous beach towns, luxury yachts, and azure seas.",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
        propertiesCount: 2,
      },
      {
        name: "Amalfi Coast",
        slug: "amalfi-coast",
        description: "A steep, cliffside strip of coastline in southern Italy, dotted with pastel-colored villages, terraced vineyards, and cliffside villas.",
        image: "https://images.unsplash.com/photo-1486082521694-51d912a3d200?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
        propertiesCount: 1,
      },
      {
        name: "Swiss Alps",
        slug: "swiss-alps",
        description: "Dramatic snow-capped peaks, luxury ski-in chalets, alpine lakes, and world-class ski trails in Switzerland.",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
        propertiesCount: 1,
      },
      {
        name: "Kyoto Gardens",
        slug: "kyoto-gardens",
        description: "Historic temples, bamboo forests, serene zen gardens, and luxury ryokans reflecting ancient Japanese heritage.",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
        propertiesCount: 1,
      },
      {
        name: "Utah Canyons",
        slug: "utah-canyons",
        description: "Sculpted orange mesas, vast desert silences, and ultra-minimalist luxury retreats nestled into slot canyon geological folds.",
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
        propertiesCount: 1,
      },
    ];

    const seededDestinations = await Destination.create(destinationsData);
    console.log("📍 Destinations seeded");

    // 3. Create Properties
    const propertiesData = [
      {
        title: "Villa Céleste",
        slug: "villa-celeste",
        description: "Perched high above the French Riviera, Villa Céleste offers panoramic sea vistas, infinity-edge swimming pool, private tennis court, and dedicated 24/7 butler service. The estate features contemporary architecture seamlessly combined with classic Mediterranean materials, offering expansive outdoor dining decks, a state-of-the-art home cinema, and a private gym.",
        type: "villa",
        status: "published",
        pricePerNight: 2450,
        address: "12 Chemin des Douaniers",
        city: "St. Tropez",
        country: "France",
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
        ],
        amenities: ["Private Pool", "Sea View", "Butler", "Gym", "Home Cinema", "Chef Service", "WiFi", "Wine Cellar"],
        bedrooms: 6,
        bathrooms: 7,
        maxGuests: 12,
        rating: 5.0,
        reviewsCount: 2,
        agent: agentUser._id,
      },
      {
        title: "The Obsidian Canopy",
        slug: "the-obsidian-canopy",
        description: "An architectural marvel constructed in the Icelandic woodlands near Grímsnes, featuring private geothermal hot springs, floor-to-ceiling glass walls, and a dedicated northern lights viewing deck. Guests can immerse themselves in raw arctic nature while enjoying premium amenities like an outdoor sauna, wood-burning fireplace, and gourmet kitchen.",
        type: "resort",
        status: "published",
        pricePerNight: 1850,
        address: "Route 36, Golden Circle",
        city: "Grímsnes",
        country: "Iceland",
        images: [
          "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
        ],
        amenities: ["Geothermal Pool", "Sauna", "Fireplace", "Northern Lights Deck", "WiFi", "Bicycles", "Mountain View"],
        bedrooms: 3,
        bathrooms: 3,
        maxGuests: 6,
        rating: 4.8,
        reviewsCount: 1,
        agent: agentUser._id,
      },
      {
        title: "Amalfi Cliffhouse",
        slug: "amalfi-cliffhouse",
        description: "Carved into the sheer cliffs of Positano, the Amalfi Cliffhouse is a historic estate updated with ultra-luxury finishes. Access is via a private lift down the cliff face. It features an infinity pool hanging over the sea, private rocky beach access, a lemon orchard terrace, and an outdoor stone oven for private pizzaiolo evenings.",
        type: "villa",
        status: "published",
        pricePerNight: 3200,
        address: "Via Cristoforo Colombo 45",
        city: "Positano",
        country: "Italy",
        images: [
          "https://images.unsplash.com/photo-1486082521694-51d912a3d200?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        ],
        amenities: ["Private Beach", "Infinity Pool", "Cliff Elevator", "Pizza Oven", "Sea View", "Chef Service", "WiFi"],
        bedrooms: 5,
        bathrooms: 6,
        maxGuests: 10,
        rating: 4.5,
        reviewsCount: 2,
        agent: agentUser._id,
      },
      {
        title: "The Kyoto Sanctuary",
        slug: "the-kyoto-sanctuary",
        description: "A serene ryokan-style luxury lodge adjacent to the historic Arashiyama bamboo groves. The Sanctuary features a handcrafted hinoki wood bathtub, a private Zen rock garden curated by a master gardener, a dedicated tatami tea ceremony room, and daily kaiseki breakfast prepared by a Michelin-starred chef.",
        type: "hotel",
        status: "published",
        pricePerNight: 1500,
        address: "18 Sagaogurayama",
        city: "Kyoto",
        country: "Japan",
        images: [
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
        ],
        amenities: ["Hinoki Bath", "Zen Garden", "Tea Room", "Michelin Chef", "Onsen Access", "WiFi", "Daily Breakfast"],
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        rating: 4.0,
        reviewsCount: 1,
        agent: agentUser._id,
      },
      {
        title: "Amangiri Sands Estate",
        slug: "amangiri-sands-estate",
        description: "Blending seamlessly into the desert mesas of southern Utah, this modernist concrete retreat features clean geometric forms, a sweeping central pool wrapped around a rock face, a private massage room, fire pits, and guided hikes into private slot canyons.",
        type: "resort",
        status: "published",
        pricePerNight: 2900,
        address: "1 Amangiri Way",
        city: "Canyon Point",
        country: "United States",
        images: [
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
        ],
        amenities: ["Desert Mesa View", "Central Pool", "Spa & Wellness", "Fire Pit", "Guided Canyon Hikes", "WiFi", "Gym"],
        bedrooms: 4,
        bathrooms: 4.5,
        maxGuests: 8,
        rating: 0,
        reviewsCount: 0,
        agent: agentUser._id,
      },
      {
        title: "Le Chalet Sommet",
        slug: "le-chalet-sommet",
        description: "An ultra-exclusive ski-in/ski-out timber chalet in Zermatt with unobstructed views of the Matterhorn. The chalet spreads over 4 levels and features an indoor swimming pool, a private cinema room, a custom wellness spa with hot tub/sauna, and a staff consisting of a chalet manager, chef, and housekeepers.",
        type: "cabin",
        status: "published",
        pricePerNight: 3800,
        address: "Winkelmatten Weg 12",
        city: "Zermatt",
        country: "Switzerland",
        images: [
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        ],
        amenities: ["Ski-in/Ski-out", "Wellness Spa", "Indoor Pool", "Matterhorn View", "Cinema Room", "Chef Service", "WiFi"],
        bedrooms: 7,
        bathrooms: 8,
        maxGuests: 14,
        rating: 5.0,
        reviewsCount: 1,
        agent: agentUser._id,
      },
      {
        title: "Riviera Glass Mansion",
        slug: "riviera-glass-mansion",
        description: "A striking minimalist villa constructed almost entirely of glass and steel in the hills of Nice. Overlooks the Mediterranean sea, features an automated home system, glass elevators, a 20-meter infinity lap pool, and a collection of curated modern art.",
        type: "mansion",
        status: "published",
        pricePerNight: 4100,
        address: "70 Boulevard de l'Observatoire",
        city: "Nice",
        country: "France",
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        ],
        amenities: ["Infinity Pool", "Elevator", "Glass Architecture", "Sea View", "Art Gallery", "WiFi", "Home Automation"],
        bedrooms: 5,
        bathrooms: 5.5,
        maxGuests: 10,
        rating: 0,
        reviewsCount: 0,
        agent: agentUser._id,
      },
    ];

    const seededProperties = await Property.create(propertiesData);
    console.log("🏠 Properties seeded");

    // 4. Create Bookings & Reviews (to link them properly)
    const booking1 = await Booking.create({
      property: seededProperties[0]._id,
      user: travelerUser._id,
      checkIn: new Date("2026-05-10"),
      checkOut: new Date("2026-05-15"),
      totalPrice: 12250,
      guests: 4,
      status: "completed",
      paymentStatus: "paid",
    });

    const booking2 = await Booking.create({
      property: seededProperties[0]._id,
      user: adminUser._id,
      checkIn: new Date("2026-06-01"),
      checkOut: new Date("2026-06-05"),
      totalPrice: 9800,
      guests: 6,
      status: "completed",
      paymentStatus: "paid",
    });

    const booking3 = await Booking.create({
      property: seededProperties[1]._id,
      user: travelerUser._id,
      checkIn: new Date("2026-04-12"),
      checkOut: new Date("2026-04-15"),
      totalPrice: 5550,
      guests: 2,
      status: "completed",
      paymentStatus: "paid",
    });

    const booking4 = await Booking.create({
      property: seededProperties[2]._id,
      user: travelerUser._id,
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-07"),
      totalPrice: 19200,
      guests: 6,
      status: "completed",
      paymentStatus: "paid",
    });

    const booking5 = await Booking.create({
      property: seededProperties[2]._id,
      user: adminUser._id,
      checkIn: new Date("2026-02-15"),
      checkOut: new Date("2026-02-20"),
      totalPrice: 16000,
      guests: 4,
      status: "completed",
      paymentStatus: "paid",
    });

    const booking6 = await Booking.create({
      property: seededProperties[3]._id,
      user: travelerUser._id,
      checkIn: new Date("2026-05-20"),
      checkOut: new Date("2026-05-23"),
      totalPrice: 4500,
      guests: 2,
      status: "completed",
      paymentStatus: "paid",
    });

    const booking7 = await Booking.create({
      property: seededProperties[5]._id,
      user: travelerUser._id,
      checkIn: new Date("2026-01-10"),
      checkOut: new Date("2026-01-17"),
      totalPrice: 26600,
      guests: 10,
      status: "completed",
      paymentStatus: "paid",
    });

    // Create Reviews
    await Review.create([
      {
        property: seededProperties[0]._id,
        user: travelerUser._id,
        booking: booking1._id,
        rating: 5,
        comment: "Absolutely outstanding. The sea view from the main terrace is breathtaking and the concierge team handled all local transport arrangements flawlessly.",
      },
      {
        property: seededProperties[0]._id,
        user: adminUser._id,
        booking: booking2._id,
        rating: 5,
        comment: "Exquisite details. The chef service prepared Michelin-level dinners every evening. Perfect for a multi-family luxury getaway.",
      },
      {
        property: seededProperties[1]._id,
        user: travelerUser._id,
        booking: booking3._id,
        rating: 4.8,
        comment: "Secluded sanctuary with incredible architecture. Watching the auroras from the private hot spring deck is an unforgettable experience.",
      },
      {
        property: seededProperties[2]._id,
        user: travelerUser._id,
        booking: booking4._id,
        rating: 4.5,
        comment: "Unique Positano location. The elevator down the cliff makes arriving feel magical. Splendid sea breeze and top service.",
      },
      {
        property: seededProperties[2]._id,
        user: adminUser._id,
        booking: booking5._id,
        rating: 4.5,
        comment: "Amazing villa layout and stunning infinity pool. The interior finishings are classic Italian style combined with top modern elements.",
      },
      {
        property: seededProperties[3]._id,
        user: travelerUser._id,
        booking: booking6._id,
        rating: 4.0,
        comment: "Serene ryokan experience. The Hinoki tub has an amazing wood fragrance. The kaiseki breakfasts were delicious, but remember it has only 2 rooms.",
      },
      {
        property: seededProperties[5]._id,
        user: travelerUser._id,
        booking: booking7._id,
        rating: 5.0,
        comment: "Exceptional chalet with premium materials and absolute comfort. The ski-in access makes Zermatt mountains feel private.",
      },
    ]);

    console.log("⭐ Reviews seeded");

    // 5. Create HeroBanner
    await HeroBanner.create({
      title: "Exclusive Retreats",
      subtitle: "Bespoke alpine chalets, Mediterranean beachside mansions, and private desert sanctuaries.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=80",
      link: "/stays",
      isActive: true,
      order: 1,
    });

    console.log("🎇 Hero Banner seeded");

    // 6. Create TourPackages
    const tourPackagesData = [
      {
        title: "Mediterranean Yacht Charter",
        description: "Cruise the French Riviera or Amalfi Coast aboard a private 80ft luxury yacht. The day includes a dedicated skipper, chef-curated seafood lunch, champagne bar, and water sports equipment.",
        duration: "Full Day (8 Hours)",
        price: 360000,
        location: "St. Tropez / Positano",
        image: "https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
      },
      {
        title: "Alpine Helicopter Transfer",
        description: "Skip the roads and glide over the Swiss Alps with a scenic helicopter flight to Zermatt, featuring panoramic Matterhorn views and direct landing access.",
        duration: "Flight (45 Minutes)",
        price: 150000,
        location: "Zermatt, Switzerland",
        image: "https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=800&q=80",
        isFeatured: true,
      },
      {
        title: "Private Kaiseki Dining",
        description: "A multi-course Japanese culinary masterpiece prepared in your private Ryokan kitchen by a Michelin-starred master chef, featuring seasonal Kyoto ingredients and sake pairing.",
        duration: "Evening (3 Hours)",
        price: 54000,
        location: "Kyoto, Japan",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
        isFeatured: false,
      },
      {
        title: "Desert Slot Canyon Exploration",
        description: "A private, geologist-led excursion into private slot canyons in southern Utah. Includes gourmet desert picnic, custom photography session, and sunset wine tasting.",
        duration: "Half Day (5 Hours)",
        price: 100000,
        location: "Canyon Point, Utah",
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
        isFeatured: false,
      },
    ];

    const seededPackages = await TourPackage.create(tourPackagesData);
    console.log("🎒 Tour Packages seeded");
    console.log("✅ Database successfully seeded!");

    return ApiResponse.success({
      message: "Database seeded successfully!",
      users: ["admin@stayora.com", "agent@stayora.com", "user@stayora.com"],
      passwordPlaceholder: "stayora123",
      propertiesCount: seededProperties.length,
      destinationsCount: seededDestinations.length,
      packagesCount: seededPackages.length,
    });
  } catch (error) {
    return ApiResponse.error(error);
  }
}
