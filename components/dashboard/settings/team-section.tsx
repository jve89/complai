"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, UserPlus, X } from "lucide-react";
import type { Invite, User } from "@prisma/client";

import {
  inviteMember,
  removeMember,
  revokeInvite,
  updateMemberName,
  updateMemberRole,
} from "@/app/dashboard/settings/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROLES = [
  { value: "admin", label: "Beheerder" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Medewerker" },
];

const ROLE_LABEL: Record<string, string> = {
  admin: "Beheerder",
  manager: "Manager",
  employee: "Medewerker",
};

function NameCell({ user, readOnly }: { user: User; readOnly?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(user.name ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    const next = value.trim();
    if (next === (user.name ?? "") || next.length < 2) {
      setValue(user.name ?? "");
      return;
    }
    startTransition(async () => {
      const res = await updateMemberName(user.id, next);
      if (res.ok) router.refresh();
    });
  }

  if (readOnly) {
    return <span className="text-sm text-foreground">{user.name ?? "—"}</span>;
  }

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      placeholder="Naam invullen"
      disabled={isPending}
      className="h-9 w-[180px]"
    />
  );
}

function RoleSelect({ user, readOnly }: { user: User; readOnly?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (readOnly) {
    return <Badge variant="secondary">{ROLE_LABEL[user.role] ?? user.role}</Badge>;
  }

  return (
    <Select
      defaultValue={user.role}
      disabled={isPending}
      onValueChange={(role) =>
        startTransition(async () => {
          await updateMemberRole(user.id, role);
          router.refresh();
        })
      }
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RemoveMemberButton({ user }: { user: User }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    const ok = confirm(
      `Collega "${user.name ?? user.email}" definitief verwijderen?\n\n` +
        `Hun login en e-learningvoortgang worden verwijderd. Dit kan niet ongedaan ` +
        `worden gemaakt.`
    );
    if (!ok) return;
    startTransition(async () => {
      const res = await removeMember(user.id);
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={onClick}
      disabled={isPending}
      className="text-red-600 hover:bg-red-50 hover:text-red-700"
      aria-label={`Verwijder ${user.name ?? user.email}`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}

function RevokeInviteButton({ invite }: { invite: Invite }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onClick() {
    const ok = confirm(`Uitnodiging voor ${invite.email} intrekken?`);
    if (!ok) return;
    startTransition(async () => {
      const res = await revokeInvite(invite.id);
      if (res.ok) router.refresh();
      else alert(res.error);
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={onClick}
      disabled={isPending}
      className="shrink-0 gap-1 text-muted-foreground hover:text-foreground"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
      Intrekken
    </Button>
  );
}

export function TeamSection({
  members,
  pendingInvites = [],
  currentUserId,
  readOnly = false,
}: {
  members: User[];
  pendingInvites?: Invite[];
  currentUserId?: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("employee");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  function invite(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    startTransition(async () => {
      const res = await inviteMember({ email, name, role });
      if (res.ok) {
        setNotice({ ok: true, text: res.message ?? "Uitnodiging verstuurd." });
        setEmail("");
        setName("");
        router.refresh();
      } else {
        setNotice({ ok: false, text: res.error });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className={readOnly ? "text-right" : undefined}>Rol</TableHead>
              {!readOnly && <TableHead className="text-right">Actie</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <NameCell user={member} readOnly={readOnly} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell className={readOnly ? "text-right" : undefined}>
                  <div className={readOnly ? "flex justify-end" : undefined}>
                    <RoleSelect user={member} readOnly={readOnly} />
                  </div>
                </TableCell>
                {!readOnly && (
                  <TableCell className="text-right">
                    {member.id === currentUserId ? (
                      <span className="pr-2 text-xs text-muted-foreground">u</span>
                    ) : (
                      <div className="flex justify-end">
                        <RemoveMemberButton user={member} />
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {readOnly && (
        <p className="text-sm text-muted-foreground">
          Alleen een beheerder kan collega&apos;s uitnodigen, rollen wijzigen of
          verwijderen.
        </p>
      )}

      {/* Pending invites — admins only */}
      {!readOnly && pendingInvites.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <div className="border-b bg-secondary/30 px-4 py-2.5">
            <p className="text-sm font-medium">Openstaande uitnodigingen</p>
          </div>
          <ul className="divide-y">
            {pendingInvites.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_LABEL[inv.role] ?? inv.role}
                    {inv.expiresAt
                      ? ` · verloopt ${new Date(inv.expiresAt).toLocaleDateString("nl-NL")}`
                      : ""}
                  </p>
                </div>
                <RevokeInviteButton invite={inv} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Invite */}
      {!readOnly && (
        <form
          onSubmit={invite}
          className="rounded-lg border border-dashed bg-secondary/30 p-4"
        >
          <p className="mb-3 text-sm font-medium">Teamlid uitnodigen</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@bedrijf.nl"
                required
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Naam (optioneel)"
              />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Uitnodigen
            </Button>
          </div>
          {notice && (
            <p
              className={
                notice.ok
                  ? "mt-3 text-sm text-emerald-600"
                  : "mt-3 text-sm text-destructive"
              }
            >
              {notice.text}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
