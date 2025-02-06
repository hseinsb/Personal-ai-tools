import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validUsername = "admin"; // Replace with your admin username
        const validPassword = "securepassword"; // Replace with your admin password

        if (
          credentials.username === validUsername &&
          credentials.password === validPassword
        ) {
          return { id: 1, name: "Admin" };
        }
        return null; // Return null if authentication fails
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: "your-secret-key", // Use a strong secret
  pages: {
    signIn: "/auth/login", // Custom login page path
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
