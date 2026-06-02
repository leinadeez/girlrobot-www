import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import InfiniteDorkness from "./components/infinite-dorkness/InfiniteDorkness";
import ThemePicker from "./components/theme-picker/ThemePicker";
import Socials from "./components/socials/Socials";
import { ThemeContextProvider } from "./context/theme";
import { ViewModeContextProvider } from "./context/viewMode";
import { buildCssVariables } from "./tokens";
import Numitron from "./components/numitron/Numitron";
import NowPlaying from "./components/now-playing/NowPlaying";
import NowGaming from "./components/now-gaming/NowGaming";
import NowLive from "./components/now-live/NowLive";
import NavMenu from "./components/nav-menu/NavMenu";
import RssFeed from "./components/rss-feed/RssFeed";
import { fetchSettings } from "./lib/settings";
import { fetchNavPages } from "./lib/pages";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettings()
  const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const author = process.env.NEXT_PUBLIC_SITE_AUTHOR
  return {
    title: settings.seoTitle,
    description: settings.tagline,
    ...(author && { authors: [{ name: author, url: siteUrl }] }),
    ...(settings.faviconPath && {
      icons: { icon: `${api}${settings.faviconPath}` },
    }),
  }
}

const copyDate = new Date().getFullYear()

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await fetchSettings()
  const navPages = await fetchNavPages()

  return (
    <html lang="pt-br">
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        <style dangerouslySetInnerHTML={{ __html: buildCssVariables(true) }} />
        <link rel="alternate" type="application/rss+xml" title={settings.seoTitle} href={`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/rss.xml`} />
      </head>
      <body suppressHydrationWarning>
        <ViewModeContextProvider>
        <ThemeContextProvider>
        <ThemeProvider />
        <div className="fixed top-1 right-1 flex flex-col gap-1 items-end z-10">
          <div className="hidden lg:block"><NowPlaying /></div>
          <div className="hidden lg:block"><NowGaming /></div>
          <div className="hidden lg:block"><NowLive /></div>
          <InfiniteDorkness links={settings.links} recommendations={settings.recommendations} />
          <Socials links={settings.socials ?? []} />
          <ThemePicker />
          {settings.rssEnabled && <RssFeed />}
        </div>
        <div className="flex flex-row w-full lg:w-[997px] mx-auto">
          <div className="wrapper">
            <header className="border border-solid border-[var(--color-border)] px-2 py-3 mb-1 flex justify-between">
              <div className="w-1/2">
                <h1>{settings.title}</h1>
                <h2>{settings.tagline}</h2>
              </div>
              <div className="flex items-end pb-1">
                <Numitron />
              </div>
            </header>
            <NavMenu pages={navPages} />
            <main>{children}</main>
            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
              <small>© {copyDate} {process.env.NEXT_PUBLIC_SITE_AUTHOR ?? settings.title}. All Rights Reserved.</small>
            </footer>
          </div>
        </div>
        </ThemeContextProvider>
        </ViewModeContextProvider>
      </body>
    </html>
  );
}
