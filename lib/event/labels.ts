import type {
  AccessKind,
  ATMOSPHERE_TERMS,
  PRICE_MODELS,
  PRIMARY_FORMATS,
} from "@/lib/domain/event-publication";
import type { MessageId } from "@/lib/i18n";

// Catalog IDs of the closed lists of an event (format, access, price form,
// atmosphere terms). Shared by the editor steps and the submit screens, so a
// value has one name in both.
export const FORMAT_ID: Record<(typeof PRIMARY_FORMATS)[number], MessageId> = {
  concert: "Z24.format.concert",
  dj_set: "Z24.format.djSet",
  club_night: "Z24.format.clubNight",
  listening_session: "Z24.format.listeningSession",
  opening: "Z24.format.opening",
  exhibition: "Z24.format.exhibition",
  screening: "Z24.format.screening",
};

export const ACCESS_ID: Record<AccessKind, MessageId> = {
  walk_in: "Z25.access.walkIn",
  door: "Z25.access.door",
  online_ticket: "Z25.access.onlineTicket",
  online_registration: "Z25.access.onlineRegistration",
};

export const PRICE_MODEL_ID: Record<(typeof PRICE_MODELS)[number], MessageId> = {
  fixed: "Z25.price.form.fixed",
  range: "Z25.price.form.range",
  from_price: "Z25.price.form.fromPrice",
  free: "Z25.price.form.free",
  donation: "Z25.price.form.donation",
  min_donation: "Z25.price.form.minDonation",
  unknown: "Z25.price.form.unknown",
};

export const ATMOSPHERE_ID: Record<(typeof ATMOSPHERE_TERMS)[number], MessageId> = {
  Gemütlich: "Z25.atmo.cozy",
  "Intim/persönlich": "Z25.atmo.intimate",
  Entspannt: "Z25.atmo.relaxed",
  Lebhaft: "Z25.atmo.lively",
  Ungezwungen: "Z25.atmo.casual",
  Experimentell: "Z25.atmo.experimental",
  "Underground/DIY": "Z25.atmo.underground",
  "Alternativ/unabhängig": "Z25.atmo.alternative",
  "Community-geprägt": "Z25.atmo.community",
  Immersiv: "Z25.atmo.immersive",
};
