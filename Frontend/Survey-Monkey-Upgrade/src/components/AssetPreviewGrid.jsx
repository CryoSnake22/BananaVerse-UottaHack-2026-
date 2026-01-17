import "../css/AssetPreviewGrid.css";

export default function AssetPreviewGrid({ images }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="asset-preview-grid">
      {images.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={`asset ${idx + 1}`}
          className="asset-thumbnail"
        />
      ))}
    </div>
  );
}
