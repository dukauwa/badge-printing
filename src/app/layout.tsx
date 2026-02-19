import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Event Manager - Badge Designer',
  description: 'Design and manage badge designs for your event attendees.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Poppins:wght@400;700&family=Raleway:wght@400;700&family=Playfair+Display:wght@400;700&family=Oswald:wght@400;700&family=Nunito:wght@400;700&family=Source+Sans+3:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
