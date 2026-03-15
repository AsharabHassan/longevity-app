import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Discover Your Biological Age | Harley Street Medical Wellness",
  description:
    "AI-powered longevity assessment. Get your wellness score, biological age, and personalized treatment plan in 3 minutes.",
  keywords: [
    "biological age test UK",
    "longevity assessment London",
    "IV therapy quiz",
    "wellness score test",
    "NAD+ IV drip London",
    "EBOO therapy UK",
  ],
  openGraph: {
    title: "Discover Your Biological Age | Harley Street Medical Wellness",
    description:
      "AI-powered longevity assessment with personalized treatment recommendations.",
    type: "website",
    siteName: "Harley Street Medical Wellness",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Your Biological Age",
    description:
      "AI-powered longevity assessment with personalized treatment recommendations.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalWebPage",
              name: "Biological Age Assessment",
              description:
                "AI-powered longevity quiz and personalized treatment recommendations",
              provider: {
                "@type": "MedicalOrganization",
                name: "Harley Street Medical Wellness",
                url: "https://harleystreetmedicalwellness.co.uk",
                address: [
                  {
                    "@type": "PostalAddress",
                    addressLocality: "London",
                    streetAddress: "Harley Street",
                    addressCountry: "GB",
                  },
                  {
                    "@type": "PostalAddress",
                    addressLocality: "Glasgow",
                    addressCountry: "GB",
                  },
                ],
              },
            }),
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} bg-bg text-foreground font-body antialiased`}
      >
        {children}
        {fbPixelId && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
