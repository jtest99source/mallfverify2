export type ImageCandidateForScoring = {
  url?: string;
  source?: string;
  field?: string;
  extractionMethod?: string;
  confidence?: string;
  reason?: string;
  widthPx?: number;
  heightPx?: number;
  imageQualityScore?: number;
  imageQualityReasons?: string[];
};

const penaltyTerms = [
  "logo",
  "logos",
  "flag",
  "flags",
  "icon",
  "favicon",
  "sticker",
  "badge",
  "sponsor",
  "partner",
  "banner-ue",
  "subvencion",
  "subvención",
  "loading",
  "svg"
];

const bonusTerms = [
  "hero",
  "gallery",
  "restaurant",
  "beach",
  "hotel",
  "room",
  "suite",
  "terrace",
  "dining",
  "food",
  "yacht",
  "boat",
  "exterior",
  "interior",
  "sunset",
  "pool",
  "spa"
];

function includesTerm(text: string, term: string) {
  return text.includes(term);
}

function getCandidateText(candidate: ImageCandidateForScoring) {
  return [
    candidate.url,
    candidate.field,
    candidate.extractionMethod,
    candidate.confidence,
    candidate.reason
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function parseLargestWidth(candidate: ImageCandidateForScoring) {
  if (candidate.widthPx && Number.isFinite(candidate.widthPx)) return candidate.widthPx;

  const text = getCandidateText(candidate);
  const widths = Array.from(text.matchAll(/(?:^|\D)(\d{3,5})(?:w|x|\D)/g))
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value));
  return widths.length ? Math.max(...widths) : 0;
}

function hasImageExtension(url: string) {
  return /\.(jpe?g|webp)(?:$|[?#])/i.test(url);
}

function isSvg(url: string) {
  return /\.svg(?:$|[?#])/i.test(url);
}

export function scoreImageCandidate(candidate: ImageCandidateForScoring) {
  const reasons: string[] = [];
  const text = getCandidateText(candidate);
  const url = candidate.url ?? "";
  let score = 30;

  if (!url.trim()) {
    return { score: -100, reasons: ["missing URL"] };
  }

  for (const term of penaltyTerms) {
    if (includesTerm(text, term)) {
      const penalty = term === "svg" ? 35 : 25;
      score -= penalty;
      reasons.push(`penalty:${term}`);
    }
  }

  for (const term of bonusTerms) {
    if (includesTerm(text, term)) {
      score += 8;
      reasons.push(`bonus:${term}`);
    }
  }

  if (candidate.confidence === "high") {
    score += 16;
    reasons.push("bonus:high confidence");
  } else if (candidate.confidence === "medium") {
    score += 8;
    reasons.push("bonus:medium confidence");
  } else if (candidate.confidence === "low") {
    score -= 6;
    reasons.push("penalty:low confidence");
  }

  if (candidate.extractionMethod === "background") {
    score += 10;
    reasons.push("bonus:background-image");
  }

  if (candidate.extractionMethod === "srcset") {
    score += 8;
    reasons.push("bonus:srcset");
  }

  if (candidate.source === "google_places" || candidate.extractionMethod === "google_places_photo") {
    score += 22;
    reasons.push("bonus:google places photo");
  }

  const largestWidth = parseLargestWidth(candidate);
  if (largestWidth >= 1200) {
    score += 18;
    reasons.push("bonus:width>=1200");
  } else if (largestWidth >= 900) {
    score += 10;
    reasons.push("bonus:width>=900");
  } else if (largestWidth > 0 && largestWidth < 500) {
    score -= 12;
    reasons.push("penalty:small image");
  }

  if (hasImageExtension(url)) {
    score += 10;
    reasons.push("bonus:jpg/jpeg/webp");
  }

  if (isSvg(url)) {
    score -= 40;
    reasons.push("penalty:svg extension");
  }

  return {
    score: Math.round(score),
    reasons
  };
}

export function scoreAndSortImageCandidates<T extends ImageCandidateForScoring>(candidates: T[]) {
  return candidates
    .map((candidate) => {
      const result = scoreImageCandidate(candidate);
      return {
        ...candidate,
        imageQualityScore: result.score,
        imageQualityReasons: result.reasons
      };
    })
    .sort((a, b) => (b.imageQualityScore ?? -999) - (a.imageQualityScore ?? -999));
}
