import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Destination from "@/models/Destination";
import Property from "@/models/Property";

export async function GET() {
  try {
    await connectToDatabase();
    const destinations = await Destination.find({});
    const properties = await Property.find({});
    
    return NextResponse.json({
      success: true,
      destinations,
      properties: properties.map(p => ({
        _id: p._id,
        title: p.title,
        city: p.city,
        status: p.status,
        destination: p.destination
      }))
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    });
  }
}
