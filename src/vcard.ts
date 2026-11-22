/** Builds a vCard 4.0 (RFC 6350) contact card. Pure. */
import type { Profile } from "./content";

/** Escape text values per RFC 6350 §3.4. */
export const escapeVcardText = (text: string): string =>
  text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\;");

export const vcard = (profile: Profile): string =>
  [
    "BEGIN:VCARD",
    "VERSION:4.0",
    `FN:${escapeVcardText(profile.name)}`,
    `N:${escapeVcardText(profile.familyName)};${escapeVcardText(profile.givenName)};;;`,
    `TITLE:${escapeVcardText(profile.role)}`,
    `EMAIL;TYPE=work:${profile.email}`,
    `TEL;VALUE=uri;TYPE="voice,text,cell":tel:${profile.phone}`,
    `ADR;TYPE=work:;;;${escapeVcardText(profile.city)};${escapeVcardText(profile.region)};;USA`,
    `URL:${profile.url}`,
    "END:VCARD",
    "",
  ].join("\r\n");
