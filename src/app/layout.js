import "./globals.css";

export const metadata = {
  title: "Moodly",
  description: "Moodly - AI-powered Mood Detection",
  keywords: [
    "mood detection",
    "emotion recognition",
    "AI",
    "webcam",
    "Next.js",
  ],
  authors: [{ name: "Shah Alom", url: "https://moodly.com" }],
  creator: "Shah Alom",
  icons: {
    icon: "/logo.png", // Favicon path (public/logo.png)
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <footer className="bg-gray-800 text-white text-center py-2 ">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Moodly. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            Made with  by
         
              Shah Alom
           
          </p>
        </footer>
      </body>
    </html>
  );
}
