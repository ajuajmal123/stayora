// Deprecated: Custom Google OAuth route replaced by NextAuth (/api/auth/[...nextauth])
export async function GET() {
  return new Response("Deprecated: Please use NextAuth endpoints instead.", { status: 410 });
}
