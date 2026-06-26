type MapPlaceholderProps = {
  area: string;
  latitude?: number;
  longitude?: number;
  label?: string;
};

function createOsmEmbedUrl(latitude: number, longitude: number) {
  const delta = 0.01;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta
  ].join("%2C");

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

export function MapPlaceholder({ area, latitude, longitude, label }: MapPlaceholderProps) {
  if (typeof latitude === "number" && typeof longitude === "number") {
    return (
      <div className="overflow-hidden border border-borderline bg-linen">
        <iframe
          title={`Mapa de ${label ?? area}`}
          src={createOsmEmbedUrl(latitude, longitude)}
          className="aspect-[16/9] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return (
    <div className="editorial-texture flex aspect-[16/9] items-center justify-center border border-dashed border-[#FFCC00]/60 bg-sea text-[11px] font-bold uppercase tracking-[0.1em] text-[#FFCC00]">
      Mapa editorial pendiente - {area}
    </div>
  );
}
