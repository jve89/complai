// Transactional email templates (NL). Simple, email-safe inline-styled HTML in
// the brand palette. Every template returns { subject, html }; the senders in
// lib/email/send.ts pick the recipient and never throw.

const BRAND = "#6366f1";
const INK = "#1e1b4b";

export interface EmailContent {
  subject: string;
  html: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Shared shell: header met logo-woordmerk, body, optionele CTA-knop, footer. */
function layout(opts: {
  preview: string;
  title: string;
  paragraphs: string[];
  cta?: { label: string; url: string };
  footnote?: string;
  footerText?: string;
}): string {
  const footerText =
    opts.footerText ??
    "ComplAI — grip op de EU AI Act. Dit is een automatisch bericht naar aanleiding van uw account of aankoop.";
  const paragraphs = opts.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#334155;">${p}</p>`
    )
    .join("");

  const cta = opts.cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:22px 0 6px;"><tr><td style="border-radius:8px;background:${BRAND};">
         <a href="${opts.cta.url}" style="display:inline-block;padding:11px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(opts.cta.label)}</a>
       </td></tr></table>`
    : "";

  const footnote = opts.footnote
    ? `<p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;">${opts.footnote}</p>`
    : "";

  return `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f4f7;">
  <span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(opts.preview)}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f7;padding:32px 12px;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <tr><td style="background:${INK};padding:18px 28px;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#ffffff;">Compl<span style="color:#a5b4fc;">AI</span></span>
      </td></tr>
      <tr><td style="padding:28px;font-family:Arial,Helvetica,sans-serif;">
        <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:${INK};">${escapeHtml(opts.title)}</h1>
        ${paragraphs}
        ${cta}
        ${footnote}
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">${escapeHtml(footerText)}</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export function welcomeEmail(opts: {
  name?: string | null;
  baseUrl: string;
  withScan: boolean;
}): EmailContent {
  const hi = opts.name ? `Beste ${escapeHtml(opts.name)},` : "Welkom,";
  return {
    subject: "Welkom bij ComplAI",
    html: layout({
      preview: "Uw ComplAI-omgeving staat klaar.",
      title: "Welkom bij ComplAI 👋",
      paragraphs: [
        hi,
        opts.withScan
          ? "Uw account is aangemaakt en het resultaat van uw risicoscan staat al klaar in uw dashboard — inclusief uw verplichtingen en de documenten die daarbij horen."
          : "Uw account is aangemaakt. U kunt direct aan de slag: doe de gratis risicoscan om te zien welke AI Act-verplichtingen voor uw organisatie gelden, en kies daarna het pakket dat bij u past.",
        "In uw dashboard vindt u het AI-register, de documentgenerator, e-learning met certificaten en uw governance-overzicht.",
      ],
      cta: { label: "Naar uw dashboard", url: `${opts.baseUrl}/dashboard` },
    }),
  };
}

export function scanResultEmail(opts: {
  score: number;
  headlineLabel: string;
  baseUrl: string;
  resultPath: string;
}): EmailContent {
  return {
    subject: `Uw risicoscan-resultaat: ${opts.score}/100`,
    html: layout({
      preview: `Gereedheidsscore ${opts.score}/100 — ${opts.headlineLabel}.`,
      title: "Uw risicoscan-resultaat",
      paragraphs: [
        `Bedankt voor het invullen van de risicoscan. Uw gereedheidsscore is <strong>${opts.score}/100</strong> en uw organisatie valt in de categorie <strong>${escapeHtml(opts.headlineLabel)}</strong>.`,
        "In het volledige rapport ziet u welke verplichtingen voor u gelden, welke documenten daarbij horen en welke stappen prioriteit hebben.",
      ],
      cta: { label: "Bekijk uw rapport", url: `${opts.baseUrl}${opts.resultPath}` },
      footnote:
        "Het resultaat is gebaseerd op uw eigen opgaven en is beslissingsondersteuning — geen juridisch advies.",
    }),
  };
}

export function purchaseEmail(opts: {
  planLabel: string | null;
  trialing: boolean;
  renewsAt?: string | null;
  baseUrl: string;
}): EmailContent {
  // "pakket Actief" (not "Actief-pakket is actief"); generic when the price id
  // couldn't be mapped — never confirm the FREE tier to a paying customer.
  const pakket = opts.planLabel
    ? `pakket <strong>${escapeHtml(opts.planLabel)}</strong>`
    : "pakket";
  return {
    subject: opts.planLabel
      ? `Bevestiging van uw aankoop — pakket ${opts.planLabel}`
      : "Bevestiging van uw aankoop",
    html: layout({
      preview: "Uw pakket is geactiveerd.",
      title: "Bedankt voor uw aankoop 🎉",
      paragraphs: [
        `Uw ${pakket} is geactiveerd. Alle documenten die bij uw pakket horen zijn nu ontgrendeld in uw dashboard.`,
        opts.trialing
          ? `De eerste maand is gratis${opts.renewsAt ? ` — de eerste afschrijving volgt op <strong>${escapeHtml(opts.renewsAt)}</strong>` : ""}. Opzeggen kan op elk moment via Instellingen → Abonnement.`
          : `${opts.renewsAt ? `Uw abonnement verlengt op <strong>${escapeHtml(opts.renewsAt)}</strong>. ` : ""}Facturen en betaalgegevens beheert u via Instellingen → Abonnement.`,
      ],
      cta: { label: "Naar uw documenten", url: `${opts.baseUrl}/dashboard/documents` },
    }),
  };
}

export function paymentFailedEmail(opts: { baseUrl: string }): EmailContent {
  return {
    subject: "Actie nodig: uw betaling is mislukt",
    html: layout({
      preview: "Werk uw betaalgegevens bij om toegang te behouden.",
      title: "Uw betaling is mislukt",
      paragraphs: [
        "De automatische afschrijving voor uw ComplAI-abonnement is niet gelukt. Dat kan gebeuren door een verlopen kaart of onvoldoende saldo.",
        "Er wordt de komende dagen automatisch opnieuw geprobeerd. Werk uw betaalgegevens bij om te voorkomen dat uw pakket wordt gepauzeerd en uw documenten worden vergrendeld.",
      ],
      cta: {
        label: "Betaalgegevens bijwerken",
        url: `${opts.baseUrl}/dashboard/settings`,
      },
    }),
  };
}

export function trialEndingEmail(opts: {
  planLabel: string | null;
  endsAt?: string | null;
  baseUrl: string;
}): EmailContent {
  const pakket = opts.planLabel
    ? `van pakket <strong>${escapeHtml(opts.planLabel)}</strong>`
    : "";
  return {
    subject: "Uw gratis proefmaand loopt bijna af",
    html: layout({
      preview: "Over enkele dagen start uw betaalde abonnement.",
      title: "Uw proefmaand loopt bijna af",
      paragraphs: [
        `Uw gratis proefmaand ${pakket} loopt ${
          opts.endsAt ? `op <strong>${escapeHtml(opts.endsAt)}</strong>` : "binnenkort"
        } af. Daarna start automatisch uw betaalde abonnement.`,
        "Wilt u doorgaan? Dan hoeft u niets te doen. Liever wijzigen of opzeggen? Dat regelt u in een paar klikken via Instellingen → Abonnement.",
      ],
      cta: { label: "Abonnement beheren", url: `${opts.baseUrl}/dashboard/settings` },
    }),
  };
}

/** Sent when the klant opzegt (cancel at period end) — access genuinely runs
 * until accessUntil, so this is the only moment that promise is true. */
export function cancelRequestedEmail(opts: {
  accessUntil?: string | null;
  baseUrl: string;
}): EmailContent {
  return {
    subject: "Uw opzegging is bevestigd",
    html: layout({
      preview: "Uw abonnement stopt aan het einde van de lopende periode.",
      title: "Uw opzegging is bevestigd",
      paragraphs: [
        `Uw ComplAI-abonnement is opgezegd${
          opts.accessUntil
            ? ` — u behoudt toegang tot de betaalde functies tot <strong>${escapeHtml(opts.accessUntil)}</strong>`
            : " en stopt aan het einde van de lopende periode"
        }. Daarna wordt er niets meer afgeschreven.`,
        "Bedenkt u zich? Tot die datum kunt u het abonnement weer activeren via Instellingen → Abonnement.",
      ],
      cta: { label: "Abonnement beheren", url: `${opts.baseUrl}/dashboard/settings` },
    }),
  };
}

/** Sent when the subscription has definitively ended. `involuntary` = ended by
 * failed payments (dunning), not by an opzegging of the klant. */
export function subscriptionEndedEmail(opts: {
  involuntary: boolean;
  baseUrl: string;
}): EmailContent {
  return {
    subject: opts.involuntary
      ? "Uw abonnement is stopgezet — betaling niet gelukt"
      : "Uw abonnement is beëindigd",
    html: layout({
      preview: "Uw ComplAI-abonnement is beëindigd.",
      title: opts.involuntary
        ? "Uw abonnement is stopgezet"
        : "Uw abonnement is beëindigd",
      paragraphs: [
        opts.involuntary
          ? "Omdat de betaling herhaaldelijk niet is gelukt, is uw ComplAI-abonnement stopgezet. Uw account, AI-register en eerder gegenereerde documenten blijven gewoon bewaard."
          : "Uw ComplAI-abonnement is beëindigd. Uw account, AI-register en eerder gegenereerde documenten blijven gewoon bewaard.",
        "Het genereren van nieuwe documenten is nu vergrendeld. U kunt op elk moment opnieuw een pakket kiezen — u gaat dan direct verder waar u was gebleven.",
      ],
      cta: { label: "Bekijk pakketten", url: `${opts.baseUrl}/pricing` },
    }),
  };
}

/** Team-uitnodiging: nu op dezelfde branded shell als de overige e-mails. */
export function inviteEmail(opts: {
  companyName: string;
  roleLabel: string;
  url: string;
}): EmailContent {
  return {
    subject: `Uitnodiging voor ${opts.companyName} op ComplAI`,
    html: layout({
      preview: `U bent uitgenodigd voor ${opts.companyName} op ComplAI.`,
      title: "U bent uitgenodigd 👋",
      paragraphs: [
        `U bent uitgenodigd om deel te nemen aan <strong>${escapeHtml(opts.companyName)}</strong> op ComplAI als <strong>${escapeHtml(opts.roleLabel)}</strong>.`,
        "Klik op de knop hieronder om de uitnodiging te accepteren en uw account aan te maken.",
      ],
      cta: { label: "Uitnodiging accepteren", url: opts.url },
      footerText:
        "ComplAI — grip op de EU AI Act. U ontvangt dit bericht omdat u bent uitgenodigd voor een ComplAI-omgeving.",
    }),
  };
}

/** Interne notificatie van het contactformulier (naar het team-adres). */
export function contactNotificationEmail(opts: {
  name: string;
  email: string;
  company?: string | null;
  formSubject?: string | null;
  message: string;
}): EmailContent {
  const who = `${escapeHtml(opts.name)} (${escapeHtml(opts.email)}${
    opts.company ? `, ${escapeHtml(opts.company)}` : ""
  })`;
  return {
    subject: `Nieuw contactbericht — ${opts.formSubject || "Algemeen"}`,
    html: layout({
      preview: `Nieuw contactbericht van ${opts.name}.`,
      title: "Nieuw contactbericht",
      paragraphs: [
        `<strong>${who}</strong> schreef via het contactformulier:`,
        `<span style="display:block;white-space:pre-wrap;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;color:#334155;">${escapeHtml(opts.message)}</span>`,
      ],
      footerText: "Intern bericht van het ComplAI-contactformulier.",
    }),
  };
}
