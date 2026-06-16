import type { Business } from "@/types/business";

type NameInput = {
  name: string;
  original_name?: string | null;
  display_name?: string | null;
};

const seoPhrases = [
  "alquiler barcos palma mallorca",
  "alquiler barcos mallorca",
  "boat rental palma mallorca",
  "boat rental mallorca",
  "yacht charter mallorca",
  "bootsvermietung",
  "sin licencia",
  "ohne fuhrerschein",
  "ohne fuehrerschein",
  "ohne führerschein"
];

function normalizeForMatch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isSeoKeywordSegment(segment: string) {
  const normalized = normalizeForMatch(segment);
  return seoPhrases.some((phrase) => normalized.includes(normalizeForMatch(phrase)));
}

function removeSeoPhrases(value: string) {
  let output = value;

  for (const phrase of seoPhrases) {
    output = output.replace(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), " ");
  }

  return output;
}

function trimSeoSegments(value: string, separator: " - " | " | ") {
  const parts = value.split(separator).map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) return value;

  const kept = parts.filter((part, index) => index === 0 || !isSeoKeywordSegment(part));
  return kept.length ? kept.join(separator.trim()) : parts[0];
}

export function cleanBusinessDisplayName(name: string) {
  const original = name.trim();
  if (!original) return original;

  let cleaned = trimSeoSegments(original, " - ");
  cleaned = trimSeoSegments(cleaned, " | ");
  cleaned = removeSeoPhrases(cleaned);
  cleaned = cleaned
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/^[\s|.,;:-]+|[\s|.,;:-]+$/g, "")
    .trim();

  if (!cleaned || cleaned.length < 3) return original;
  if (cleaned.length <= 2 && original.length > cleaned.length) return original;

  return cleaned;
}

export function normalizeBusinessName(input: NameInput) {
  const originalName = input.original_name?.trim() || input.name;
  const displayName = cleanBusinessDisplayName(input.name);

  return {
    original_name: originalName,
    display_name: displayName || input.name,
    name_quality_status: "normalized"
  };
}

export function getBusinessPublicName(business: Pick<Business, "name" | "displayName">) {
  return business.displayName?.trim() || business.name;
}
