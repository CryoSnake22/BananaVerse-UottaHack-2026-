import { useMemo } from "react";
import "../css/ImageSelectionCard.css";

function ImageSelectionCard({ img1, img2, img3, img4, img5, value, onSelectionChange }) {
  const images = useMemo(
    () => [img1, img2, img3, img4, img5].filter(Boolean),
    [img1, img2, img3, img4, img5]
  );

  return (
    <div className="image-selection-card">
      <div className="image-options" role="list">
        {images.map((src_path, index) => {
          const isSelected = value === src_path;

          return (
            <button
              key={src_path + index}
              type="button"
              className={`img ${isSelected ? "is-selected" : ""}`}
              onClick={() => onSelectionChange?.(src_path)}
              aria-pressed={isSelected}
            >
              <img src={src_path} alt="Image option." />
            </button>
          );
        })}
      </div>

      <div className={`selected-image-display ${value ? "is-open" : ""}`}>
        {value ? (
          <div className="preview-inner">
            <img src={value} alt="Selected image." className="preview-img" />
          </div>
        ) : (
          <div className="preview-placeholder">
            Pick the item you want to add to your landscape.
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageSelectionCard;
