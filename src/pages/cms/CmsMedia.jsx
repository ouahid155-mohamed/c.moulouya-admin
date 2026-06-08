import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import "./CmsMedia.css";

const MEDIA_LABELS = {
  main_video: "Vidéo de présentation",
  main_video_thumbnail: "Miniature de la vidéo de présentation",
  specialty_video: "Vidéo section spécialités",
  specialty_video_thumbnail: "Miniature de la vidéo section spécialités",
  about_main: "Histoire - image principale",
  about_tl: "Histoire - image haut gauche",
  about_br: "Histoire - image bas droite",
};

const MEDIA_HELP = {
  main_video: "Première vidéo affichée sur la page d'accueil.",
  main_video_thumbnail: "Image visible avant lecture de la vidéo de présentation.",
  specialty_video: "Vidéo affichée dans la section détail des spécialités.",
  specialty_video_thumbnail: "Image visible avant lecture de la vidéo des spécialités.",
  about_main: "Grande image centrale du collage histoire.",
  about_tl: "Petite image en haut à gauche du collage histoire.",
  about_br: "Petite image en bas à droite du collage histoire.",
};

export default function CmsMedia() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const fileInputs = useRef({});

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/cms/media");
      setMediaList(res.data);
    } catch (err) {
      console.error(err);
      notify("Erreur lors du chargement des médias", "error");
    } finally {
      setLoading(false);
    }
  };

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleFileChange = async (key, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("key", key);
    formData.append("file", file);

    setUploadingKey(key);
    try {
      const res = await api.post("/admin/cms/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      notify("Média mis à jour avec succès");
      setMediaList((prev) =>
        prev.map((media) => (media.key === key ? res.data.media : media))
      );
      fetchMedia();
    } catch (err) {
      console.error(err);
      notify(err.response?.data?.message || "Erreur lors de l'upload", "error");
    } finally {
      setUploadingKey(null);
      if (fileInputs.current[key]) fileInputs.current[key].value = "";
    }
  };

  const triggerFileInput = (key) => {
    fileInputs.current[key]?.click();
  };

  if (loading && mediaList.length === 0) {
    return <div className="me-loading">Chargement des médias...</div>;
  }

  return (
    <div className="me-wrapper">
      <div className="me-header">
        <h1 className="me-page-title">Médias modifiables</h1>
        <p className="me-page-subtitle">
          Seuls les 2 vidéos avec leurs miniatures et les 3 images de la section histoire peuvent être remplacés.
        </p>
      </div>

      {message.text && (
        <div className={`me-alert me-alert--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="me-grid">
        {mediaList.map((media) => (
          <div className="me-card" key={media.key}>
            <div className="me-card-header">
              <h3 className="me-card-title">{MEDIA_LABELS[media.key] || media.key}</h3>
              <span className="me-card-key">{media.key}</span>
            </div>

            <div className="me-preview-box">
              {uploadingKey === media.key ? (
                <div className="me-upload-overlay">
                  <div className="me-spinner" />
                  <span>Téléchargement...</span>
                </div>
              ) : media.url ? (
                media.type === "video" ? (
                  <video src={media.url} className="me-preview-video" controls />
                ) : (
                  <img src={media.url} alt={MEDIA_LABELS[media.key] || media.key} className="me-preview-img" />
                )
              ) : (
                <div className="me-no-file-box">
                  <span className="me-no-file-badge">Asset local par défaut</span>
                  <p className="me-no-file-desc">
                    Aucun fichier personnalisé mis en ligne. Le site utilise le fichier statique du code source.
                  </p>
                </div>
              )}
            </div>

            <div className="me-card-footer">
              <p className="me-filename">{MEDIA_HELP[media.key]}</p>
              <input
                type="file"
                ref={(el) => (fileInputs.current[media.key] = el)}
                onChange={(e) => handleFileChange(media.key, e)}
                style={{ display: "none" }}
                accept={media.type === "video" ? "video/*" : "image/*"}
              />
              <button
                className="me-upload-btn"
                onClick={() => triggerFileInput(media.key)}
                disabled={uploadingKey !== null}
              >
                {media.url ? "Remplacer le fichier" : "Mettre en ligne un fichier"}
              </button>
              {media.original_name && (
                <span className="me-filename" title={media.original_name}>
                  Fichier: {media.original_name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
