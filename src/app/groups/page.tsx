"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

interface Group {
  id: string;
  name: string;
  description: string | null;
  _count?: { members: number };
}

export default function GroupsPage() {
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
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, isPublic: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setGroups((g) => [data.group, ...g]);
      setShowCreate(false);
      setName("");
      setDescription("");
    }
  };

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-shell">
      <PageHeader
        title="Study groups"
        subtitle="Study together, stay accountable"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Create group
          </button>
        }
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search groups…"
        className="input-field mb-6"
      />

      {showCreate && (
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
