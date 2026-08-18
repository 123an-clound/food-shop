export function MapEmbed({ mapEmbedUrl, title }: { mapEmbedUrl: string; title: string }) {
  if (!mapEmbedUrl) {
    return null;
  }

  return (
    <iframe
      src={mapEmbedUrl}
      title={title}
      className="h-80 w-full rounded-lg border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
