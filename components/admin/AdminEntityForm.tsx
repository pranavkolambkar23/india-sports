"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Textarea } from "@/components/ui/textarea";

type EntityType = "player" | "team" | "tournament";
type SportOption = { id: string; name: string; slug: string };
type TeamOption = { id: string; name: string; sportId: string };

type EntityFormState = {
  [key: string]: string | string[] | Record<string, string> | null | undefined;
  socialLinks?: Record<string, string>;
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

const entityLabels: Record<EntityType, string> = {
  player: "Player",
  team: "Team",
  tournament: "Tournament",
};

function token() {
  return localStorage.getItem("india-sports-admin-token") || "";
}

function dateValue(value?: string | Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function AdminEntityForm({
  type,
  id,
}: {
  type: EntityType;
  id?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<EntityFormState>({
    country: "India",
    status: "UPCOMING",
    profileStatus: "REVIEW",
    verificationStatus: "SOURCE_LINKED",
    socialLinks: {},
  });

  const selectedSportId = form.sportId || "";
  const filteredTeams = useMemo(
    () => teams.filter((team) => !selectedSportId || team.sportId === selectedSportId),
    [teams, selectedSportId]
  );

  useEffect(() => {
    let mounted = true;
    const auth = token();
    const headers = { authorization: `Bearer ${auth}` };
    const loadingTimeout = setTimeout(() => {
      if (mounted) setLoading(true);
    }, 0);

    const sportRequest = fetch("/api/admin/sports", { headers }).then((response) =>
      response.ok ? response.json() : []
    );
    const teamRequest = type === "player"
      ? fetch("/api/admin/teams", { headers }).then((response) =>
          response.ok ? response.json() : []
        )
      : Promise.resolve([]);
    const entityRequest = id
      ? fetch(`/api/admin/${type}s/${id}`, { headers }).then((response) =>
          response.ok ? response.json() : null
        )
      : Promise.resolve(null);

    Promise.all([sportRequest, teamRequest, entityRequest]).then(([sportList, teamList, entity]) => {
      if (!mounted) return;
      setSports(sportList);
      setTeams(teamList);

      const sportSlug = searchParams.get("sport");
      const selectedSport = sportList.find((sport: SportOption) => sport.slug === sportSlug);

      if (entity) {
        setForm({
          ...entity,
          sportId: entity.sportId || entity.sport?.id || "",
          teamId: entity.teamId || entity.team?.id || "",
          birthDate: dateValue(entity.birthDate),
          startDate: dateValue(entity.startDate),
          endDate: dateValue(entity.endDate),
          streamingPlatforms: Array.isArray(entity.streamingPlatforms)
            ? entity.streamingPlatforms.join(", ")
            : entity.streamingPlatforms || "",
          socialLinks: entity.socialLinks || {},
        });
      } else if (selectedSport) {
        setForm((current) => ({ ...current, sportId: selectedSport.id }));
      }

      setLoading(false);
    }).catch((error) => {
      if (!mounted) return;
      toast.error(error instanceof Error ? error.message : "Could not load form data.");
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
    };
  }, [id, searchParams, type]);

  function update(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateSocial(field: string, value: string) {
    setForm((current) => ({
      ...current,
      socialLinks: { ...(current.socialLinks || {}), [field]: value },
    }));
  }

  async function uploadImage(file: File, field: "logo" | "avatar" | "imageUrl") {
    setUploading(true);

    try {
      const auth = token();
      const compressed = await compressImage(file);
      const data = new FormData();
      data.append("file", compressed);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { authorization: `Bearer ${auth}` },
        body: data,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Image upload failed.");
      }

      update(field, payload.url);
      toast.success(`Image uploaded at ${(compressed.size / 1024).toFixed(0)} KB.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      const auth = token();
      const endpoint = id ? `/api/admin/${type}s/${id}` : `/api/admin/${type}s`;
      const response = await fetch(endpoint, {
        method: id ? "PUT" : "POST",
        headers: {
          authorization: `Bearer ${auth}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || `Could not save ${entityLabels[type].toLowerCase()}.`);
      }

      toast.success(`${entityLabels[type]} saved.`);
      if (type === "player") router.push("/players");
      if (type === "team") router.push(`/sports/${sports.find((sport) => sport.id === form.sportId)?.slug || ""}`);
      if (type === "tournament") router.push("/tournaments");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            Loading {entityLabels[type].toLowerCase()} details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingScreen />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {id ? "Edit" : "Create"} {entityLabels[type]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium">
              Sport
              <select
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
                value={form.sportId || ""}
                onChange={(event) => update("sportId", event.target.value)}
                required
              >
                <option value="">Select sport</option>
                {sports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              value={form.name || ""}
              onChange={(event) => update("name", event.target.value)}
              placeholder={`${entityLabels[type]} name`}
              required
            />
          </div>

          {type === "player" && (
            <>
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border bg-muted">
                  {form.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={String(form.avatar)}
                      alt={String(form.name || "Player image")}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-3">
                  <Input
                    value={String(form.avatar || "")}
                    onChange={(event) => update("avatar", event.target.value)}
                    placeholder="Profile image URL"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadImage(file, "avatar");
                      event.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload />
                    {uploading ? "Uploading..." : "Upload Player Image"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Images are compressed before upload. Server limit: 500 KB.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  Current team / club
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
                    value={form.teamId || ""}
                    onChange={(event) => update("teamId", event.target.value)}
                  >
                    <option value="">Independent / no team</option>
                    {filteredTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Input
                  value={form.currentAcademy || ""}
                  onChange={(event) => update("currentAcademy", event.target.value)}
                  placeholder="Current club / academy"
                />
                <Input
                  value={form.position || ""}
                  onChange={(event) => update("position", event.target.value)}
                  placeholder="Position"
                />
                <Input
                  value={form.ageGroup || ""}
                  onChange={(event) => update("ageGroup", event.target.value)}
                  placeholder="Age group"
                />
                <Input
                  type="date"
                  value={form.birthDate || ""}
                  onChange={(event) => update("birthDate", event.target.value)}
                />
                <Input
                  value={form.birthPlace || ""}
                  onChange={(event) => update("birthPlace", event.target.value)}
                  placeholder="Birthplace"
                />
                <Input
                  value={form.nationality || "India"}
                  onChange={(event) => update("nationality", event.target.value)}
                  placeholder="Nationality"
                />
              </div>
              <Textarea
                value={form.bio || ""}
                onChange={(event) => update("bio", event.target.value)}
                placeholder="Player bio"
                className="min-h-28"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={form.socialLinks?.twitter || ""}
                  onChange={(event) => updateSocial("twitter", event.target.value)}
                  placeholder="X / Twitter"
                />
                <Input
                  value={form.socialLinks?.instagram || ""}
                  onChange={(event) => updateSocial("instagram", event.target.value)}
                  placeholder="Instagram"
                />
                <Input
                  value={form.socialLinks?.facebook || ""}
                  onChange={(event) => updateSocial("facebook", event.target.value)}
                  placeholder="Facebook"
                />
                <Input
                  value={form.socialLinks?.youtube || ""}
                  onChange={(event) => updateSocial("youtube", event.target.value)}
                  placeholder="YouTube"
                />
              </div>
            </>
          )}

          {type === "team" && (
            <>
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  {form.logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={String(form.logo)}
                      alt={String(form.name || "Team logo")}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-3">
                  <Input
                    value={String(form.logo || "")}
                    onChange={(event) => update("logo", event.target.value)}
                    placeholder="Logo URL"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadImage(file, "logo");
                      event.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload />
                    {uploading ? "Uploading..." : "Upload Logo"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Images are compressed before upload. Server limit: 500 KB.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={form.shortName || ""}
                  onChange={(event) => update("shortName", event.target.value)}
                  placeholder="Short name"
                />
                <Input
                  value={form.city || ""}
                  onChange={(event) => update("city", event.target.value)}
                  placeholder="City"
                />
                <Input
                  value={form.state || ""}
                  onChange={(event) => update("state", event.target.value)}
                  placeholder="State"
                />
                <Input
                  value={form.country || "India"}
                  onChange={(event) => update("country", event.target.value)}
                  placeholder="Country"
                />
                <Input
                  value={form.website || ""}
                  onChange={(event) => update("website", event.target.value)}
                  placeholder="Website"
                />
              </div>
              <Textarea
                value={form.description || ""}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Team description"
                className="min-h-28"
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">Social media</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    value={form.socialLinks?.twitter || ""}
                    onChange={(event) => updateSocial("twitter", event.target.value)}
                    placeholder="X / Twitter handle or URL"
                  />
                  <Input
                    value={form.socialLinks?.instagram || ""}
                    onChange={(event) => updateSocial("instagram", event.target.value)}
                    placeholder="Instagram handle or URL"
                  />
                  <Input
                    value={form.socialLinks?.facebook || ""}
                    onChange={(event) => updateSocial("facebook", event.target.value)}
                    placeholder="Facebook URL"
                  />
                  <Input
                    value={form.socialLinks?.youtube || ""}
                    onChange={(event) => updateSocial("youtube", event.target.value)}
                    placeholder="YouTube URL"
                  />
                </div>
              </div>
            </>
          )}

          {type === "tournament" && (
            <>
              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  {form.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={String(form.imageUrl)}
                      alt={String(form.name || "Tournament image")}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-3">
                  <label className="space-y-1 text-sm font-medium">
                    Tournament image URL
                    <Input
                      value={String(form.imageUrl || "")}
                      onChange={(event) => update("imageUrl", event.target.value)}
                      placeholder="Image URL"
                    />
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadImage(file, "imageUrl");
                      event.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload />
                    {uploading ? "Uploading..." : "Upload Image"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Images are compressed before upload. Server limit: 500 KB.
                  </p>
                </div>
              </div>

              <div className="grid items-start gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  Status
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
                    value={form.status || "UPCOMING"}
                    onChange={(event) => update("status", event.target.value)}
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="LIVE">Live</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Website URL
                  <Input
                    value={form.websiteUrl || ""}
                    onChange={(event) => update("websiteUrl", event.target.value)}
                    placeholder="Official website URL"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium md:col-span-2">
                  Winner
                  <Input
                    value={form.winner || ""}
                    onChange={(event) => update("winner", event.target.value)}
                    placeholder="Winning team, player, or country"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Start date
                  <Input
                    type="date"
                    value={form.startDate || ""}
                    onChange={(event) => update("startDate", event.target.value)}
                    required
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  End date
                  <Input
                    type="date"
                    value={form.endDate || ""}
                    onChange={(event) => update("endDate", event.target.value)}
                  />
                </label>
              </div>

              <div className="grid items-start gap-4 md:grid-cols-3">
                <label className="space-y-1 text-sm font-medium md:col-span-3">
                  Location
                  <Input
                    value={form.location || ""}
                    onChange={(event) => update("location", event.target.value)}
                    placeholder="Venue or host city"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  City
                  <Input
                    value={form.city || ""}
                    onChange={(event) => update("city", event.target.value)}
                    placeholder="City"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  State
                  <Input
                    value={form.state || ""}
                    onChange={(event) => update("state", event.target.value)}
                    placeholder="State"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Country
                  <Input
                    value={form.country || "India"}
                    onChange={(event) => update("country", event.target.value)}
                    placeholder="Country"
                  />
                </label>
              </div>

              <div className="grid items-start gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  Streaming platforms
                  <Input
                    value={form.streamingPlatforms || ""}
                    onChange={(event) => update("streamingPlatforms", event.target.value)}
                    placeholder="YouTube, FIFA+, JioHotstar"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Streaming URL
                  <Input
                    value={form.streamingUrl || ""}
                    onChange={(event) => update("streamingUrl", event.target.value)}
                    placeholder="Live stream URL"
                  />
                </label>
              </div>
              <Textarea
                value={form.description || ""}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Tournament description"
                className="min-h-28"
              />
            </>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
