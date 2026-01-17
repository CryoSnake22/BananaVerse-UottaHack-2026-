import {useMemo, useState} from "react";
import "../css/ImageSelectionCard.css";

function ImageSelectionCard({img1, img2, img3, img4, img5}) {

    const images = useMemo( () => [img1, img2, img3, img4, img5].filter(Boolean), [img1, img2, img3, img4, img5])

    const [selectedIndex, setSelectedIndex] = useState(images.length ? 0 : null);

    const selectedImageByIndex = selectedIndex !== null ? images[selectedIndex] : null;

    


    return (
        <div className="image-selection-card">
            <div className="image-options" role = "list">
                {images.map( (src_path, index) => (
                    <button
                        key = {src_path + index}
                        type="button"
                        className={`img ${index === selectedIndex ? "is-selected" : ""}`}
                        onClick={(() => setSelectedIndex(index))}
                        aria-pressed={index === selectedIndex}
                        
                    >
                        <img src={src_path} alt="Image option." />
                    </button>
                ))}
            </div>

            <div className={`selected-image-display ${selectedImageByIndex ? "is-open" : ""}`}>
                { selectedImageByIndex ? (
                    <div className="preview-inner">
                        <img src={selectedImageByIndex} alt="Selected image." className="preview-img" />
                    </div>
                ) : (
                    <div className="preview-placeholder">Select the item to add to you landscape!</div>

                )}

            </div>



        </div>
    )

}

export default ImageSelectionCard;