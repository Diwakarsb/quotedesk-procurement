import "./globals.css";
import Sidebar from "./_shell/Sidebar";
import Topbar from "./_shell/Topbar";

export const metadata = {
  title: "QuoteDesk — Procurement workspace",
  description: "Draft an RFx, read whatever vendors send back, interrogate the result — one dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" />
      </head>
      <body>
        <div className="shell">
          <Sidebar />
          <div className="main-col">
            <Topbar />
            <div className="content">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
