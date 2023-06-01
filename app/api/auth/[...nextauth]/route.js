import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDb } from '@utils/database';
import User from '@models/user';

const replaceSpecialChars = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/([^\w]+|\s+)/g, '-') // Replace space and other characters by hyphen
    .replace(/\-\-+/g, '-') // Replaces multiple hyphens by one hyphen
    .replace(/(^-+|-+$)/g, '')
    .replace('-', ''); // Remove extra hyphens from beginning or end of the string
};

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],

  callbacks: {
    async session({ session }) {
      const sessionUser = await User.findOne({
        email: session.user.email,
      });

      session.user.id = sessionUser._id.toString();

      return session;
    },
    async signIn({ profile }) {
      profile.name = replaceSpecialChars(profile.name);
      console.log(profile);
      // serverless -> Lambda -> dynamodb
      try {
        await connectToDb();

        //Check if a user already exists
        const userExists = await User.findOne({
          email: profile.email,
        });

        // If, not, create a new user
        if (!userExists) {
          await User.create({
            email: profile.email,
            userName: profile.name.replace(' ', '').toLowerCase(),
            image: profile.picture,
          });
        }

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
