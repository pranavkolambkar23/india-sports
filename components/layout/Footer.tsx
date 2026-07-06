import Link from "next/link";
import { Trophy, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-orange-600 text-white text-sm">
                🇮🇳
              </span>
              India Sports
            </div>
            <p className="text-sm text-muted-foreground">
              Promoting and supporting Indian athletes across all sports.
              Building visibility, community, and opportunity.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/sports" className="hover:text-foreground">
                  All Sports
                </Link>
              </li>
              <li>
                <Link href="/tournaments" className="hover:text-foreground">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link href="/players" className="hover:text-foreground">
                  Players
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-foreground">
                  Events Map
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/achievements" className="hover:text-foreground">
                  Recent Achievements
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-foreground">
                  Event Calendar
                </Link>
              </li>
              <li>
                <Link href="/donate" className="hover:text-foreground">
                  Support Athletes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contribute</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Help us grow by contributing data, code, or donations.
            </p>
            <div className="flex gap-2">
              <Link
                href="/donate"
                className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
              >
                <Heart className="h-3 w-3" />
                Donate
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} India Sports. Made with pride for 🇮🇳
            athletes.
          </p>
        </div>
      </div>
    </footer>
  );
}
