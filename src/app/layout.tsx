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
  title: "Lifestyle Age Assessment | Harley Street Medical Wellness",
  description:
    "A free lifestyle age estimate. A three-minute questionnaire, every figure sourced from published research, and a free consultation to go through it.",
  keywords: [
    "lifestyle age assessment",
    "longevity assessment London",
    "longevity clinic Glasgow",
    "healthy ageing consultation",
  ],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Lifestyle Age Assessment | Harley Street Medical Wellness",
    description:
      "A free lifestyle age estimate with every figure sourced from published research.",
    type: "website",
    siteName: "Harley Street Medical Wellness",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lifestyle Age Assessment",
    description:
      "A free lifestyle age estimate with every figure sourced from published research.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalWebPage",
              name: "Lifestyle Age Assessment",
              description:
                "A questionnaire-based lifestyle age estimate sourced from published research",
              provider: {
                "@type": "MedicalOrganization",
                name: "Harley Street Medical Wellness",
                url: "https://harleystreetmedicalwellness.co.uk",
                address: {
                    "@type": "PostalAddress",
                    streetAddress: "1-5 Portpool Lane",
                    addressLocality: "London",
                    postalCode: "EC1N 7UU",
                    addressCountry: "GB",
                  },
                  telephone: "+442046283137",
                  email: "hello@harleystreetwellness.co.uk",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} bg-bg text-foreground font-body antialiased`}
        suppressHydrationWarning
      >
        {children}
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
            fbq('init', '1613661453278984');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1613661453278984&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
