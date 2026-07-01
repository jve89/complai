"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import type { User } from "@prisma/client";

import {
  inviteMember,
  updateMemberName,
  updateMemberRole,
} from "@/app/dashboard/settings/actions";
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

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      placeholder="Naam invullen"
      disabled={isPending || readOnly}
      className="h-9 w-[180px]"
    />
  );
}

function RoleSelect({ user, readOnly }: { user: User; readOnly?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={user.role}
      disabled={isPending || readOnly}
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

export function TeamSection({
  members,
  readOnly = false,
}: {
  members: User[];
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
              <TableHead className="text-right">Rol</TableHead>
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
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <RoleSelect user={member} readOnly={readOnly} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {readOnly && (
        <p className="text-sm text-muted-foreground">
          Uitnodigen en rollen beheren is beschikbaar in uw eigen omgeving.
        </p>
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
