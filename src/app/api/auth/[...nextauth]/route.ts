import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      try {
        await connectToDatabase();
        let dbUser = await User.findOne({ email: user.email });
        
        if (!dbUser) {
          // If the user doesn't exist, create a new record with default role: "user"
          const hashedPassword = await bcrypt.hash("nextauth_google_auth_real_password_" + Math.random(), 10);
          dbUser = new User({
            name: user.name || "Traveler",
            email: user.email,
            password: hashedPassword,
            role: "user",
            avatar: user.image || "",
            isVerified: true,
          });
          await dbUser.save();
        } else {
          // Block sign-in if the user is suspended
          if (dbUser.isBlocked) {
            return false;
          }
          
          // Sync profile fields if modified on Google side
          let needsSave = false;
          if (user.name && dbUser.name !== user.name) {
            dbUser.name = user.name;
            needsSave = true;
          }
          if (user.image && dbUser.avatar !== user.image) {
            dbUser.avatar = user.image;
            needsSave = true;
          }
          if (needsSave) {
            await dbUser.save();
          }
        }
        return true;
      } catch (err) {
        console.error("NextAuth signIn callback error:", err);
        return false;
      }
    },
    
    async jwt({ token }) {
      try {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        }
      } catch (err) {
        console.error("NextAuth jwt callback error:", err);
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
