import nodemailer from "nodemailer";

interface BookingDetails {
  _id: string;
  checkIn: Date | string;
  checkOut: Date | string;
  guests: number;
  totalPrice: number;
}

interface PropertyDetails {
  title: string;
  city: string;
  country: string;
  address: string;
}

/**
 * Sends a premium HTML confirmation email to the user upon admin booking approval.
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
            <span>Luxury Travel & Premium Retreats</span>
          </div>
          <div class="content">
            <p class="welcome">Dear Traveler,</p>
            <p class="welcome">
              We are delighted to inform you that your premium stay reservation at <strong>${property.title}</strong> has been officially confirmed by our concierge team.
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
              Our verified local host Marcus coordinates chef bookings, excursions, and transport links. Should you have any special requirements, please feel free to reach out to us.
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

  if (!emailPass) {
    console.warn("[Stayora Mailer] WARNING: SMTP password EMAIL_PASS is not configured in .env. Skipping actual SMTP mail send.");
    console.log("[Stayora Mailer] GRACEFUL LOGGED CONFIRMATION EMAIL CONTENT:\n", emailHtml);
    return true; // Return true as mock success for development safety
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"Stayora Luxury Bookings" <${emailUser}>`,
      to: toEmail,
      subject: `Booking Confirmed: ${property.title} | Stayora`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Stayora Mailer] Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[Stayora Mailer] Error sending SMTP email:", error);
    // Log details gracefully to console so it does not block application operations
    return false;
  }
}
