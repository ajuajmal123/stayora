import nodemailer from "nodemailer";

interface BookingDetails {
  _id: string;
  checkIn: Date | string;
  checkOut: Date | string;
  guests: number;
  totalPrice: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;
}

interface PropertyDetails {
  title: string;
  city: string;
  country: string;
  address: string;
  amenities?: string[];
}

/**
 * Generates a valid PDF-1.4 file buffer containing the booking details matching the voucher layout design.
 */
function generateBookingPdfBuffer(booking: any, property: any): Buffer {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);

  const formatDateStr = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const pdf = {
    rect: (x: number, y: number, w: number, h: number, fill = false, stroke = true) => {
      const op = fill && stroke ? "B" : fill ? "f" : "S";
      return `${x} ${y} ${w} ${h} re ${op}`;
    },
    line: (x1: number, y1: number, x2: number, y2: number) => {
      return `${x1} ${y1} m ${x2} ${y2} l S`;
    },
    text: (str: string, x: number, y: number, fontSize: number, font = "F1", color = "0 0 0") => {
      const escaped = str
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
      return `q ${color} rg BT /${font} ${fontSize} Tf ${x} ${y} Td (${escaped}) Tj ET Q`;
    }
  };

  const drawCheckmark = (x: number, y: number) => {
    return `q 0.2 0.7 0.3 rg 2 w ${x} ${y+3} m ${x+3} ${y} l ${x+9} ${y+7} l S Q`;
  };

  // Build stream 1 (Page 1)
  let stream1 = "";
  // Draw light gold background for check-in / check-out boxes
  stream1 += `q 0.99 0.99 0.97 rg 0.87 0.73 0.45 RG 1 w ${pdf.rect(50, 630, 235, 70, true, true)} Q\n`;
  stream1 += `q 0.99 0.99 0.97 rg 0.87 0.73 0.45 RG 1 w ${pdf.rect(310, 630, 235, 70, true, true)} Q\n`;

  // Draw header divider
  stream1 += `q 0.01 0.11 0.09 RG 1.5 w ${pdf.line(50, 715, 545, 715)} Q\n`;

  // Draw vertical marker for STAY & GUEST DETAILS
  stream1 += `q 0.72 0.56 0.28 rg ${pdf.rect(50, 580, 4, 16, true, false)} Q\n`;

  // Draw Table border for guest details
  stream1 += `q 0.9 0.85 0.75 RG 0.5 w ${pdf.rect(50, 340, 495, 228, false, true)} Q\n`;
  // Horizontal lines inside table
  for (let i = 1; i < 6; i++) {
    stream1 += `q 0.9 0.85 0.75 RG 0.5 w ${pdf.line(50, 568 - i * 38, 545, 568 - i * 38)} Q\n`;
  }
  // Vertical line in table
  stream1 += `q 0.9 0.85 0.75 RG 0.5 w ${pdf.line(180, 340, 180, 568)} Q\n`;

  // Draw vertical marker for Amenities and Activities
  stream1 += `q 0.72 0.56 0.28 rg ${pdf.rect(50, 295, 4, 16, true, false)} Q\n`;
  stream1 += `q 0.72 0.56 0.28 rg ${pdf.rect(310, 295, 4, 16, true, false)} Q\n`;

  // Draw outer boxes for Amenities and Activities
  stream1 += `q 0.9 0.85 0.75 RG 0.5 w ${pdf.rect(50, 70, 235, 210, false, true)} Q\n`;
  stream1 += `q 0.9 0.85 0.75 RG 0.5 w ${pdf.rect(310, 70, 235, 210, false, true)} Q\n`;

  // Page 1 Text and Vector Logo commands
  // Draw an elegant gold geometric diamond logo mark
  stream1 += `q 0.72 0.56 0.28 rg 1 w 50 771 m 60 786 l 70 771 l 60 756 l h B Q\n`;
  // Inner center dark green core
  stream1 += `q 0.01 0.11 0.09 rg 59 770 2 2 re f Q\n`;

  stream1 += pdf.text("STAYORA", 82, 771, 22, "F2", "0.01 0.11 0.09") + "\n";
  stream1 += pdf.text("BOUTIQUE RETREATS", 82, 760, 6.5, "F2", "0.72 0.56 0.28") + "\n";
  stream1 += pdf.text(`${property.title.toUpperCase()} BOOKING VOUCHER`, 50, 742, 11, "F2", "0.72 0.56 0.28") + "\n";
  stream1 += pdf.text(`Property Location: ${property.address}, ${property.city} | Status: Confirmed`, 50, 728, 8.5, "F1", "0.4 0.4 0.4") + "\n";

  // Check-in details
  stream1 += pdf.text("CHECK-IN DATE", 65, 680, 8, "F1", "0.5 0.5 0.5") + "\n";
  stream1 += pdf.text(formatDateStr(checkInDate), 65, 658, 15, "F2", "0.01 0.11 0.09") + "\n";
  stream1 += pdf.text("Standard Check-In: 02:00 PM", 65, 642, 8, "F2", "0.72 0.56 0.28") + "\n";

  // Check-out details
  stream1 += pdf.text("CHECK-OUT DATE", 325, 680, 8, "F1", "0.5 0.5 0.5") + "\n";
  stream1 += pdf.text(formatDateStr(checkOutDate), 325, 658, 15, "F2", "0.01 0.11 0.09") + "\n";
  stream1 += pdf.text("Standard Check-Out: 11:00 AM", 325, 642, 8, "F2", "0.72 0.56 0.28") + "\n";

  stream1 += pdf.text("STAY & GUEST DETAILS", 62, 583, 11, "F2", "0.01 0.11 0.09") + "\n";

  // Table rows
  const rowLabels = ["Primary Guest", "Contact Number", "Guest Location", "Total Occupancy", "Property Name", "Booking Scope"];
  const rowValues = [
    booking.name || "Guest",
    booking.phoneNumber || "",
    property.city || "",
    `${booking.guests} Guest(s)`,
    property.title,
    "Full Property Booking"
  ];
  for (let i = 0; i < 6; i++) {
    const yText = 568 - (i * 38) - 24;
    stream1 += pdf.text(rowLabels[i], 65, yText, 9, "F1", "0.3 0.3 0.3") + "\n";
    const isBold = i === 0 || i === 5;
    stream1 += pdf.text(rowValues[i], 195, yText, 9, isBold ? "F2" : "F1", "0.01 0.11 0.09") + "\n";
  }

  stream1 += pdf.text("RESORT AMENITIES", 62, 298, 11, "F2", "0.01 0.11 0.09") + "\n";
  stream1 += pdf.text("ACTIVITIES AVAILABLE", 322, 298, 11, "F2", "0.01 0.11 0.09") + "\n";

  let amenitiesList = booking.customAmenities && booking.customAmenities.length > 0
    ? booking.customAmenities
    : (property.amenities && property.amenities.length > 0 ? property.amenities : [
        "Big Infinity Swimming Pool",
        "Campfire Experience Area",
        "Barbecue Facility Available",
        "Music Speaker with Microphone",
        "Indoor Games Area & Chess",
        "Coffee Plantation Ambience"
      ]);
  amenitiesList = amenitiesList.slice(0, 6);
  const activitiesList = [
    "Kids Play Area",
    "Carroms & Board Games",
    "Shuttle & Badminton Court",
    "Pool Activities & Fun Games",
    "Coffee Plantation Walk",
    "Sightseeing Tour"
  ].slice(0, 6);

  for (let i = 0; i < amenitiesList.length; i++) {
    const yList = 250 - (i * 30);
    stream1 += drawCheckmark(65, yList) + "\n";
    stream1 += pdf.text(amenitiesList[i], 80, yList, 8.5, "F1", "0.2 0.2 0.2") + "\n";
  }

  for (let i = 0; i < activitiesList.length; i++) {
    const yList = 250 - (i * 30);
    stream1 += drawCheckmark(325, yList) + "\n";
    stream1 += pdf.text(activitiesList[i], 340, yList, 8.5, "F1", "0.2 0.2 0.2") + "\n";
  }

  // Page 1 Footer
  stream1 += pdf.text(`Stayora Stays • ${property.title} Voucher`, 50, 40, 8, "F1", "0.5 0.5 0.5") + "\n";
  stream1 += pdf.text("Page 1", 520, 40, 8, "F1", "0.5 0.5 0.5") + "\n";

  // Build stream 2 (Page 2)
  let stream2 = "";
  // Draw header divider
  stream2 += `q 0.01 0.11 0.09 RG 1.5 w ${pdf.line(50, 760, 545, 760)} Q\n`;

  // Draw vertical marker for PAYMENT SUMMARY
  stream2 += `q 0.72 0.56 0.28 rg ${pdf.rect(50, 715, 4, 16, true, false)} Q\n`;

  // Draw Payment table box
  stream2 += `q 0.9 0.85 0.75 RG 0.5 w ${pdf.rect(50, 550, 495, 150, false, true)} Q\n`;
  stream2 += `q 0.9 0.85 0.75 RG 0.5 w ${pdf.line(50, 650, 545, 650)} Q\n`;
  stream2 += `q 0.9 0.85 0.75 RG 0.5 w ${pdf.line(50, 600, 545, 600)} Q\n`;

  // Highlight Balance Due Row
  stream2 += `q 0.99 0.99 0.97 rg ${pdf.rect(51, 551, 493, 48, true, false)} Q\n`;

  // Draw vertical marker for RULES & REGULATIONS
  stream2 += `q 0.72 0.56 0.28 rg ${pdf.rect(50, 505, 4, 16, true, false)} Q\n`;

  // Rules outer box
  stream2 += `q 0.9 0.85 0.75 RG 0.5 w ${pdf.rect(50, 200, 495, 290, false, true)} Q\n`;

  // Content for page 2
  stream2 += pdf.text("PAYMENT SUMMARY", 62, 718, 11, "F2", "0.01 0.11 0.09") + "\n";

  const totalVal = booking.totalPrice;
  const advanceVal = typeof booking.advancePaid === "number" && booking.advancePaid > 0
    ? booking.advancePaid
    : Math.round(totalVal * 0.2);
  const balanceVal = Math.max(0, totalVal - advanceVal);

  stream2 += pdf.text("Total Tariff Amount", 65, 668, 9, "F1", "0.3 0.3 0.3") + "\n";
  stream2 += pdf.text(`Rs. ${totalVal.toLocaleString("en-IN")}`, 440, 668, 10, "F2", "0.01 0.11 0.09") + "\n";

  stream2 += pdf.text("Advance Paid (Non-Refundable)", 65, 618, 9, "F1", "0.3 0.3 0.3") + "\n";
  stream2 += pdf.text(`Rs. ${advanceVal.toLocaleString("en-IN")}`, 440, 618, 10, "F2", "0.05 0.5 0.25") + "\n";

  stream2 += pdf.text("Balance Due at Check-In Time", 65, 568, 9, "F2", "0.72 0.56 0.28") + "\n";
  stream2 += pdf.text(`Rs. ${balanceVal.toLocaleString("en-IN")}`, 440, 568, 10, "F2", "0.72 0.56 0.28") + "\n";

  stream2 += pdf.text("RESORT RULES & REGULATIONS", 62, 508, 11, "F2", "0.01 0.11 0.09") + "\n";

  let rawRules = booking.customRules && booking.customRules.length > 0
    ? booking.customRules
    : (property.rules && property.rules.length > 0 ? property.rules : []);

  let rulesList = [];
  if (rawRules && rawRules.length > 0) {
    rulesList = rawRules.map((ruleStr: string) => {
      const colonIdx = ruleStr.indexOf(":");
      if (colonIdx !== -1) {
        return [ruleStr.substring(0, colonIdx).trim(), ruleStr.substring(colonIdx + 1).trim()];
      }
      return ["House Guideline", ruleStr];
    });
  } else {
    rulesList = [
      ["Cancellation Policy", `The advance booking amount of Rs. ${advanceVal.toLocaleString("en-IN")} is strictly non-refundable under any circumstances.`],
      ["Arrival & Departure Timings", "Check-in time begins at 2:00 PM. Check-out must be strictly completed by 11:00 AM to facilitate turnaround."],
      ["Balance Settlement", `The remaining outstanding balance of Rs. ${balanceVal.toLocaleString("en-IN")} must be cleared entirely at the time of check-in.`],
      ["Swimming Pool Rules", "Proper nylon swimwear is mandatory. Pool access and associated pool activities close strictly by 10:00 PM."],
      ["Sound & Quiet Hours", "Music speakers, microphone usage, and high-volume sound limits are strictly implemented after 10:00 PM."],
      ["Property Rules & Verification", "All guests must provide valid government-issued photo ID cards upon check-in. Any damage will be billed."]
    ];
  }
  rulesList = rulesList.slice(0, 6);

  for (let i = 0; i < rulesList.length; i++) {
    const yRule = 465 - (i * 42);
    stream2 += `q 0.8 0.2 0.2 rg ${pdf.rect(65, yRule + 3, 3, 3, true, false)} Q\n`;
    stream2 += pdf.text(`${rulesList[i][0]}:`, 75, yRule, 8.5, "F2", "0.8 0.2 0.2") + "\n";
    stream2 += pdf.text(rulesList[i][1], 205, yRule, 7.8, "F1", "0.2 0.2 0.2") + "\n";
  }

  stream2 += pdf.text(`Thank you for choosing Stayora. We look forward to hosting your group for an elite getaway at ${property.title}!`, 50, 155, 9, "F3", "0.3 0.3 0.3") + "\n";

  // Page 2 Footer
  stream2 += pdf.text(`Stayora Stays • ${property.title} Voucher`, 50, 40, 8, "F1", "0.5 0.5 0.5") + "\n";
  stream2 += pdf.text("Page 2", 520, 40, 8, "F1", "0.5 0.5 0.5") + "\n";

  // Wrap stream contents inside PDF Objects
  const s1Content = `BT\nET\n${stream1}`;
  const s2Content = `BT\nET\n${stream2}`;

  const s1Len = Buffer.byteLength(s1Content, "utf-8");
  const s2Len = Buffer.byteLength(s2Content, "utf-8");

  const pdfHeader = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 595 842] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F3 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >> >> >>
endobj
5 0 obj
<< /Length ${s1Len} >>
stream
`;

  const pdfMiddle = `
endstream
endobj
6 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 595 842] /Contents 7 0 R >>
endobj
7 0 obj
<< /Length ${s2Len} >>
stream
`;

  const pdfFooter = `
endstream
endobj
xref
0 8
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000212 00000 n 
0000000343 00000 n 
0000000450 00000 n 
0000000557 00000 n 
trailer
<< /Size 8 /Root 1 0 R >>
startxref
900
%%EOF
`;

  return Buffer.concat([
    Buffer.from(pdfHeader, "utf-8"),
    Buffer.from(s1Content, "utf-8"),
    Buffer.from(pdfMiddle, "utf-8"),
    Buffer.from(s2Content, "utf-8"),
    Buffer.from(pdfFooter, "utf-8"),
  ]);
}

/**
 * Sends an HTML confirmation email to the user upon admin booking approval.
 */
export async function sendBookingConfirmationEmail(
  toEmail: string,
  booking: BookingDetails,
  property: PropertyDetails
): Promise<boolean> {
  const emailUser = process.env.EMAIL_USER || "stayoraenquiry@gmail.com";
  const emailPass = process.env.EMAIL_PASS;

  console.log(`[Stayora Mailer] Preparing to send confirmation to: ${toEmail}`);
  console.log(`[Stayora Mailer] Booking details: ID ${booking._id}, Resort: ${property.title}, Total: ₹${booking.totalPrice}`);

  // Format dates nicely
  const checkInDate = new Date(booking.checkIn).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Stayora Booking Confirmed</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #faf9f6;
            color: #080d0c;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border: 1px solid #dfba73;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(3, 28, 22, 0.05);
          }
          .header {
            background-color: #031c16;
            color: #faf9f6;
            padding: 40px 20px;
            text-align: center;
            border-bottom: 3px solid #d4af37;
          }
          .header h1 {
            margin: 0;
            font-family: Georgia, serif;
            font-size: 28px;
            font-weight: 300;
            letter-spacing: 2px;
          }
          .header span {
            color: #d4af37;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 3px;
            font-weight: bold;
            display: block;
            margin-top: 8px;
          }
          .content {
            padding: 40px 30px;
          }
          .welcome {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .card {
            border: 1px solid #f4f1ea;
            background-color: #faf9f6;
            border-radius: 6px;
            padding: 24px;
            margin-bottom: 30px;
          }
          .card h2 {
            margin-top: 0;
            font-family: Georgia, serif;
            font-size: 20px;
            color: #063c30;
            border-bottom: 1px solid #dfba73;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
          }
          .detail-label {
            color: #888888;
            font-weight: bold;
          }
          .detail-value {
            color: #080d0c;
            font-weight: 500;
            text-align: right;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            border-top: 1px dashed #dfba73;
            padding-top: 15px;
            margin-top: 15px;
            font-size: 16px;
            font-weight: bold;
          }
          .total-value {
            color: #b89047;
          }
          .footer {
            background-color: #f4f1ea;
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #888888;
            border-top: 1px solid #e2ded5;
          }
          .footer a {
            color: #063c30;
            text-decoration: none;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>STAYORA</h1>
            <span>Boutique Retreats</span>
          </div>
          <div class="content">
            <p class="welcome">Dear ${booking.name || "Traveler"},</p>
            <p class="welcome">
              We are delighted to inform you that your stay reservation at <strong>${property.title}</strong> has been officially confirmed by our concierge team. We have attached a PDF copy of your confirmation receipt for your records.
            </p>
            
            <div class="card">
              <h2>Reservation Details</h2>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value" style="font-family: monospace;">${booking._id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Property:</span>
                <span class="detail-value">${property.title}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${property.address}, ${property.city}, ${property.country}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Check-In:</span>
                <span class="detail-value">${checkInDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Check-Out:</span>
                <span class="detail-value">${checkOutDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Guests Count:</span>
                <span class="detail-value">${booking.guests} Guest(s)</span>
              </div>
              <div class="total-row">
                <span>Total Billing:</span>
                <span class="total-value">₹${booking.totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
            
            <p class="welcome" style="margin-bottom: 0;">
              Our verified local host coordinates chef bookings, excursions, and transport links. Should you have any special requirements, please feel free to reach out to us.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Stayora Inc. All rights reserved. <br>
            For urgent requests, contact concierge: <a href="https://wa.me/918590120810">Chat on WhatsApp</a>
          </div>
        </div>
      </body>
    </html>
  `;

  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = generateBookingPdfBuffer(booking, property);
  } catch (pdfErr) {
    console.error("[Stayora Mailer] Failed to generate confirmation PDF:", pdfErr);
  }

  if (!emailPass) {
    console.warn("[Stayora Mailer] WARNING: SMTP password EMAIL_PASS is not configured in .env. Skipping actual SMTP mail send.");
    console.log("[Stayora Mailer] GRACEFUL LOGGED CONFIRMATION EMAIL CONTENT:\n", emailHtml);
    return true; // Return true as mock success for development safety
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions: any = {
      from: `"Stayora Bookings" <${emailUser}>`,
      to: toEmail,
      subject: `Booking Confirmed: ${property.title} | Stayora`,
      html: emailHtml,
    };

    if (pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: `Stayora_Confirmation_${booking._id.toString().substring(18)}.pdf`,
          content: pdfBuffer,
        }
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Stayora Mailer] Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[Stayora Mailer] Error sending SMTP email:", error);
    // Log details gracefully to console so it does not block application operations
    return false;
  }
}
