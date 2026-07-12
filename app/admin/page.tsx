"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Download,
  Edit,
  ExternalLink,
  FileJson,
  ImageIcon,
  LogOut,
  RefreshCw,
  Save,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type AchievementDraft = {
  title: string;
  description?: string;
  date?: string;
  category: "INTERNATIONAL" | "NATIONAL" | "DOMESTIC";
  sourceUrls: string[];
};

type TournamentDraft = {
  name: string;
  status: "PAST" | "CURRENT" | "UPCOMING";
  notes?: string;
  sourceUrls: string[];
};

type PlayerDraft = {
  name: string;
  slug: string;
  avatar?: string;
  birthDate?: string;
  birthPlace?: string;
  position?: string;
  ageGroup?: string;
  currentAcademy?: string;
  bio: string;
  achievements: AchievementDraft[];
  tournaments: TournamentDraft[];
  socialLinks: Record<string, string>;
  sourceUrls: string[];
};

type PersonDraft = {
  name: string;
  slug: string;
  avatar?: string;
  roleTitle: string;
  organization?: string;
  bio: string;
  contributionSummary: string;
  socialLinks: Record<string, string>;
  sourceUrls: string[];
};

type ImportResult = {
  generatedAt: string;
  storageRecommendation: string;
  imagePolicy: { maxBytes: number; formats: string[]; note: string };
  sources: Array<{ title: string; url: string; status: string }>;
  players: PlayerDraft[];
  people: PersonDraft[];
  tournaments: Array<{
    name: string;
    status: string;
    streamingInfo?: string;
    sourceUrls: string[];
  }>;
};

type SavedPlayer = {
  id: string;
  name: string;
  slug: string;
  avatar?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  bio?: string | null;
  position?: string | null;
  ageGroup?: string | null;
  currentAcademy?: string | null;
  profileStatus: string;
  verificationStatus: string;
  socialLinks?: Record<string, string> | null;
  sourceUrls?: string[];
  sport: { name: string };
  achievements?: Array<{
    title: string;
    description?: string | null;
    date?: string;
    category: "INTERNATIONAL" | "NATIONAL" | "DOMESTIC";
  }>;
  tournaments?: Array<{
    status: "PAST" | "CURRENT" | "UPCOMING";
    notes?: string | null;
    sourceUrls?: string[];
    tournament: {
      name: string;
    };
  }>;
};

const MAX_IMAGE_BYTES = 500 * 1024;

async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_IMAGE_BYTES && file.type === "image/webp") return file;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const maxSide = 1200;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare image compression.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );
    if (blob && blob.size <= MAX_IMAGE_BYTES) {
      return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, {
        type: "image/webp",
      });
    }
  }

  throw new Error("Image could not be compressed below 500 KB.");
}

function playerToDraft(player: SavedPlayer): PlayerDraft {
  return {
    name: player.name,
    slug: player.slug,
    avatar: player.avatar || undefined,
    birthDate: player.birthDate?.slice(0, 10) || undefined,
    birthPlace: player.birthPlace || undefined,
    position: player.position || undefined,
    ageGroup: player.ageGroup || undefined,
    currentAcademy: player.currentAcademy || undefined,
    bio: player.bio || "",
    achievements:
      player.achievements?.map((achievement) => ({
        title: achievement.title,
        description: achievement.description || undefined,
        date: achievement.date?.slice(0, 10),
        category: achievement.category,
        sourceUrls: [],
      })) || [],
    tournaments:
      player.tournaments?.map((entry) => ({
        name: entry.tournament.name,
        status: entry.status,
        notes: entry.notes || undefined,
        sourceUrls: entry.sourceUrls || [],
      })) || [],
    socialLinks: player.socialLinks || {},
    sourceUrls: player.sourceUrls || [],
  };
}

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<{ email: string; userId: string } | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [focus, setFocus] = useState("Minerva Academy youth football");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selected, setSelected] = useState<PlayerDraft | null>(null);
  const [peopleDrafts, setPeopleDrafts] = useState<PersonDraft[]>([]);
  const [savedPlayers, setSavedPlayers] = useState<SavedPlayer[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const sourceCount = useMemo(
    () => importResult?.sources.filter((source) => source.status === "checked").length || 0,
    [importResult]
  );

  const authHeaders = useMemo(
    () =>
      adminToken
        ? { authorization: `Bearer ${adminToken}` }
        : undefined,
    [adminToken]
  );

  async function loadPlayers(token = adminToken) {
    if (!token) return;
    const response = await fetch("/api/admin/players", {
      headers: { authorization: `Bearer ${token}` },
    });
    if (response.ok) setSavedPlayers(await response.json());
  }

  async function verifyAdmin(token: string | null) {
    setAdminToken(token);

    if (!token) {
      setIsAdmin(false);
      setAdminUser(null);
      setSavedPlayers([]);
      return false;
    }

    const response = await fetch("/api/admin/me", {
      headers: { authorization: `Bearer ${token}` },
    });

    const allowed = response.ok;
    setIsAdmin(allowed);

    if (!allowed) {
      localStorage.removeItem("india-sports-admin-token");
      setAdminToken(null);
      setAdminUser(null);
      setSavedPlayers([]);
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error || "This account is not an admin.");
    } else {
      const payload = await response.json();
      setAdminUser({ email: payload.email, userId: payload.userId });
    }

    return allowed;
  }

  useEffect(() => {
    let isMounted = true;
    const authTimeout = setTimeout(() => {
      const token = localStorage.getItem("india-sports-admin-token");

      verifyAdmin(token).then(async (allowed) => {
        if (allowed && token) {
          const response = await fetch("/api/admin/players", {
            headers: { authorization: `Bearer ${token}` },
          });
          if (response.ok && isMounted) setSavedPlayers(await response.json());
        }
        if (isMounted) setIsAuthLoading(false);
      });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
    };
  }, []);

  async function loginAdmin() {
    setIsLoginSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: adminEmail.trim(),
          password,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Admin login failed.");

      localStorage.setItem("india-sports-admin-token", payload.token);
      window.dispatchEvent(new Event("india-sports-admin-auth"));
      setAdminToken(payload.token);
      setAdminUser(payload.user);
      const allowed = await verifyAdmin(payload.token);
      if (allowed) {
        toast.success("Admin login successful.");
        await loadPlayers(payload.token);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Admin login failed.");
    } finally {
      setIsLoginSubmitting(false);
    }
  }

  async function logoutAdmin() {
    localStorage.removeItem("india-sports-admin-token");
    window.dispatchEvent(new Event("india-sports-admin-auth"));
    setAdminToken(null);
    setAdminUser(null);
    setIsAdmin(false);
    setSavedPlayers([]);
    setSelected(null);
    toast.success("Signed out.");
  }

  async function runSync() {
    if (!authHeaders) return;
    setIsSyncing(true);
    try {
      const response = await fetch("/api/admin/import/football", {
        method: "POST",
        headers: { "content-type": "application/json", ...authHeaders },
        body: JSON.stringify({ focus }),
      });
      if (!response.ok) throw new Error("Football import failed.");
      const result = (await response.json()) as ImportResult;
      setImportResult(result);
      setSelected(result.players[0] || null);
      setPeopleDrafts(result.people);
      toast.success("Football sync prepared review drafts.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Football sync failed.");
    } finally {
      setIsSyncing(false);
    }
  }

  async function savePlayer() {
    if (!selected || !authHeaders) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "content-type": "application/json", ...authHeaders },
        body: JSON.stringify(selected),
      });
      if (!response.ok) throw new Error("Could not save player draft.");
      await loadPlayers();
      toast.success(`${selected.name} saved for review.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function savePerson(person: PersonDraft) {
    if (!authHeaders) return;
    const response = await fetch("/api/admin/people", {
      method: "POST",
      headers: { "content-type": "application/json", ...authHeaders },
      body: JSON.stringify(person),
    });

    if (response.ok) {
      toast.success(`${person.name} contributor profile saved.`);
    } else {
      toast.error(`Could not save ${person.name}.`);
    }
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !selected || !authHeaders) return;

    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      const data = new FormData();
      data.append("file", compressed);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: authHeaders,
        body: data,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed.");
      }
      const result = await response.json();
      setSelected({ ...selected, avatar: result.url });
      toast.success(`Image saved at ${(compressed.size / 1024).toFixed(0)} KB.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function exportPlayer(player: SavedPlayer) {
    if (!authHeaders) return;
    const response = await fetch(`/api/admin/players/${player.id}/export`, {
      headers: authHeaders,
    });

    if (!response.ok) {
      toast.error("Could not export player.");
      return;
    }

    const payload = await response.json();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${player.slug}-profile.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Checking admin session...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-orange-600" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              placeholder="Admin email"
              autoComplete="email"
            />
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              onKeyDown={(event) => {
                if (event.key === "Enter") loginAdmin();
              }}
            />
            <Button
              className="w-full"
              onClick={loginAdmin}
              disabled={isLoginSubmitting || !adminEmail || !password}
            >
              <ShieldCheck />
              {isLoginSubmitting ? "Signing in..." : "Sign in as admin"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Your Supabase user must have a matching `Profile` row with role `admin`.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Sync Indian football data, review source-linked drafts, add profile images, and export player JSON.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="w-fit">
            Admin: {adminUser?.email}
          </Badge>
          <Badge variant="outline" className="w-fit">
            Supabase Storage recommended, 500 KB image limit
          </Badge>
          <Button variant="outline" size="sm" onClick={logoutAdmin}>
            <LogOut />
            Sign out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sync" className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="sync">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync
          </TabsTrigger>
          <TabsTrigger value="editor">
            <Users className="mr-2 h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="export">
            <FileJson className="mr-2 h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Football Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Input value={focus} onChange={(event) => setFocus(event.target.value)} />
                <Button onClick={runSync} disabled={isSyncing}>
                  <RefreshCw className={isSyncing ? "animate-spin" : ""} />
                  Run Sync
                </Button>
              </div>
              {importResult && (
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-2xl font-bold">{importResult.players.length}</p>
                    <p className="text-sm text-muted-foreground">Player drafts</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-2xl font-bold">{peopleDrafts.length}</p>
                    <p className="text-sm text-muted-foreground">Contributor drafts</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-2xl font-bold">{sourceCount}</p>
                    <p className="text-sm text-muted-foreground">Sources reachable</p>
                  </div>
                </div>
              )}
              {importResult && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Source checks</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {importResult.sources.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted"
                      >
                        <span>{source.title}</span>
                        <Badge variant={source.status === "checked" ? "secondary" : "outline"}>
                          {source.status}
                        </Badge>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {importResult && (
            <div className="grid gap-4 lg:grid-cols-2">
              {importResult.players.map((player) => (
                <Card key={player.slug} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{player.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {player.ageGroup || "Youth"} / {player.position || "Position to verify"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelected(player)}>
                        Edit
                      </Button>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{player.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          {selected ? (
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <Card>
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                    {selected.avatar ? (
                      <img src={selected.avatar} alt={selected.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={uploadImage} disabled={isUploading} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Compressed before upload. Server limit: 500 KB.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Player Draft</CardTitle>
                  <Button onClick={savePlayer} disabled={isSaving}>
                    <Save />
                    Save
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      value={selected.name}
                      onChange={(event) => setSelected({ ...selected, name: event.target.value })}
                      placeholder="Name"
                    />
                    <Input
                      value={selected.position || ""}
                      onChange={(event) => setSelected({ ...selected, position: event.target.value })}
                      placeholder="Position"
                    />
                    <Input
                      value={selected.ageGroup || ""}
                      onChange={(event) => setSelected({ ...selected, ageGroup: event.target.value })}
                      placeholder="Age group"
                    />
                    <Input
                      value={selected.currentAcademy || ""}
                      onChange={(event) => setSelected({ ...selected, currentAcademy: event.target.value })}
                      placeholder="Current club / academy"
                    />
                    <Input
                      type="date"
                      value={selected.birthDate?.slice(0, 10) || ""}
                      onChange={(event) => setSelected({ ...selected, birthDate: event.target.value })}
                      placeholder="Date of birth"
                    />
                    <Input
                      value={selected.birthPlace || ""}
                      onChange={(event) => setSelected({ ...selected, birthPlace: event.target.value })}
                      placeholder="Birthplace"
                    />
                  </div>
                  <Textarea
                    value={selected.bio}
                    onChange={(event) => setSelected({ ...selected, bio: event.target.value })}
                    className="min-h-32"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Social media</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        value={selected.socialLinks.twitter || ""}
                        onChange={(event) =>
                          setSelected({
                            ...selected,
                            socialLinks: { ...selected.socialLinks, twitter: event.target.value },
                          })
                        }
                        placeholder="X / Twitter handle or URL"
                      />
                      <Input
                        value={selected.socialLinks.instagram || ""}
                        onChange={(event) =>
                          setSelected({
                            ...selected,
                            socialLinks: { ...selected.socialLinks, instagram: event.target.value },
                          })
                        }
                        placeholder="Instagram handle or URL"
                      />
                      <Input
                        value={selected.socialLinks.facebook || ""}
                        onChange={(event) =>
                          setSelected({
                            ...selected,
                            socialLinks: { ...selected.socialLinks, facebook: event.target.value },
                          })
                        }
                        placeholder="Facebook URL"
                      />
                      <Input
                        value={selected.socialLinks.youtube || ""}
                        onChange={(event) =>
                          setSelected({
                            ...selected,
                            socialLinks: { ...selected.socialLinks, youtube: event.target.value },
                          })
                        }
                        placeholder="YouTube URL"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Achievements</p>
                    {selected.achievements.map((achievement) => (
                      <div key={achievement.title} className="rounded-lg border p-3">
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Sources</p>
                    {selected.sourceUrls.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary">
                        <ExternalLink className="h-3 w-3" />
                        {url}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Run a football sync and choose a player draft to edit.
              </CardContent>
            </Card>
          )}

          {peopleDrafts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Contributor Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {peopleDrafts.map((person) => (
                  <div key={person.slug} className="flex items-start justify-between gap-4 rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-sm text-muted-foreground">{person.roleTitle}</p>
                      <p className="mt-2 text-sm">{person.contributionSummary}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => savePerson(person)}>
                      <Save />
                      Save
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Saved Players</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedPlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {player.avatar ? (
                        <img src={player.avatar} alt={player.name} className="h-full w-full object-cover" />
                      ) : (
                        <Users className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {player.sport.name} / {player.currentAcademy || "Team to verify"} / {player.verificationStatus}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelected(playerToDraft(player));
                        toast.success(`${player.name} loaded in editor.`);
                      }}
                    >
                      <Edit />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportPlayer(player)}>
                      <Download />
                      Export
                    </Button>
                  </div>
                </div>
              ))}
              {savedPlayers.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No saved player profiles yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
