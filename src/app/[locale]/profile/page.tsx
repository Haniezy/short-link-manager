import { requireSession } from "@/lib/auth/guard";
import { getProfile } from "@/lib/db/queries";
import { ProfilePage } from "@/components/profile-page";

export default async function Page() {
  const { user } = await requireSession();
  const data = await getProfile(user.id);
  return (
    <ProfilePage
      email={user.email}
      initial={
        data.profile ?? {
          displayName: user.name || user.email.split("@")[0],
          avatarUrl: user.image || "",
          bio: "",
        }
      }
      stats={{
        count: data.count,
        joined: user.createdAt ?? null,
        lastActivity: data.lastActivity,
      }}
    />
  );
}
