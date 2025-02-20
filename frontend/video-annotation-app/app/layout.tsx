import "./globals.css";

export const metadata = {
  title: "Video Annotation App",
  description: "Annotate videos with time codes!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="bg-blue-500 text-white p-4">
          <h1 className="text-center text-2xl">Video Annotation App</h1>
        </header>
        <main className="p-4">{children}</main>
        <footer className="bg-gray-800 text-white text-center p-2">
          <p>© 2024 Video Annotation App</p>
        </footer>
      </body>
    </html>
  );
}
