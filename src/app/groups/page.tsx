"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { PremiumUpsell } from "@/components/ui/PremiumUpsell";
import { FREE_LIMITS } from "@/lib/utils";

interface Group {
  id: string;
  name: string;
  description: string | null;
  _count?: { members: number };
}

export default function GroupsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const isPremium = session?.user?.isPremium ?? false;

  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((d) => setGroups(d.groups ?? []))
      .catch(() => {});
  }, []);

  const createGroup = async () => {
    if (!isPremium) {
      toast("Creating groups is a Premium feature", "error");
      return;
    }

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, isPublic: true }),
    });
    const data = await res.json();
    if (res.ok) {
      setGroups((g) => [data.group, ...g]);
      setShowCreate(false);
      setName("");
      setDescription("");
    } else {
      toast(data.error ?? "Could not create group", "error");
    }
  };

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-shell">
      <PageHeader
        title="Study groups"
        subtitle={
          isPremium
            ? "Create and join study groups"
            : `Join up to ${FREE_LIMITS.groupsJoin} groups · creating groups is Premium`
        }
        action={
          isPremium ? (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Create group
            </button>
          ) : (
            <Link href="/pricing" className="btn-secondary">
              Create group 🔒
            </Link>
          )
        }
      />

      {!isPremium && (
        <PremiumUpsell
          className="mb-6"
          title="Premium: create study groups"
          description={`Free accounts can join up to ${FREE_LIMITS.groupsJoin} groups. Upgrade to create up to 10 groups and join 30.`}
        />
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search groups…"
        className="input-field mb-6"
      />

      {showCreate && isPremium && (
        <div className="glass-card mb-6 space-y-3 p-6">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="input-field" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="input-field min-h-[80px] resize-none" />
          <div className="flex gap-2">
            <button onClick={createGroup} className="btn-primary">Create</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((group) => (
          <Link key={group.id} href={`/groups/${group.id}`} className="glass-card p-5 transition-colors hover:border-[var(--primary)]/40">
            <h3 className="font-heading font-semibold">{group.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{group.description}</p>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              {group._count?.members ?? 0} members
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
