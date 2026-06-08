import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./CmsSpecialties.css";

export default function CmsSpecialties() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null); // null means adding new

  const [form, setForm] = useState({
    title_fr: "",
    title_en: "",
    title_ar: "",
    description_fr: "",
    description_en: "",
    description_ar: "",
    order: 0,
    active: true,
  });

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/cms/specialties");
      setSpecialties(res.data);
    } catch (err) {
      console.error(err);
      notify("Erreur lors du chargement des spécialités", "error");
    } finally {
      setLoading(false);
    }
  };

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingSpecialty(null);
    setForm({
      title_fr: "",
      title_en: "",
      title_ar: "",
      description_fr: "",
      description_en: "",
      description_ar: "",
      order: specialties.length,
      active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (spec) => {
    setEditingSpecialty(spec);
    setForm({
      title_fr: spec.title_fr || "",
      title_en: spec.title_en || "",
      title_ar: spec.title_ar || "",
      description_fr: spec.description_fr || "",
      description_en: spec.description_en || "",
      description_ar: spec.description_ar || "",
      order: spec.order ?? 0,
      active: !!spec.active,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette spécialité ?")) return;
    try {
      await api.delete(`/admin/cms/specialties/${id}`);
      notify("Spécialité supprimée avec succès ✓");
      fetchSpecialties();
    } catch (err) {
      console.error(err);
      notify("Erreur lors de la suppression", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSpecialty) {
        await api.put(`/admin/cms/specialties/${editingSpecialty.id}`, form);
        notify("Spécialité modifiée avec succès ✓");
      } else {
        await api.post("/admin/cms/specialties", form);
        notify("Spécialité ajoutée avec succès ✓");
      }
      setModalOpen(false);
      fetchSpecialties();
    } catch (err) {
      console.error(err);
      notify("Erreur lors de l'enregistrement", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading && specialties.length === 0) {
    return <div className="sp-loading">Chargement des spécialités...</div>;
  }

  return (
    <div className="sp-wrapper">
      <div className="sp-header-row">
        <div>
          <h1 className="sp-page-title">Spécialités</h1>
          <p className="sp-page-subtitle">
            Gérez les spécialités médicales présentées sur le site vitrine.
          </p>
        </div>
        <button className="sp-add-btn" onClick={handleOpenAddModal}>
          + Ajouter une spécialité
        </button>
      </div>

      {message.text && (
        <div className={`sp-alert sp-alert--${message.type}`}>
          {message.text}
        </div>
      )}

      {specialties.length === 0 ? (
        <div className="sp-empty-box">Aucune spécialité enregistrée.</div>
      ) : (
        <div className="sp-table-card">
          <table className="sp-table">
            <thead>
              <tr>
                <th>Ordre</th>
                <th>Titre (FR)</th>
                <th>Titre (EN)</th>
                <th>Titre (AR)</th>
                <th>Description (FR)</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {specialties.map((spec) => (
                <tr key={spec.id} className={!spec.active ? "inactive-row" : ""}>
                  <td className="sp-td-order">{spec.order}</td>
                  <td className="sp-td-title">{spec.title_fr}</td>
                  <td className="sp-td-title">{spec.title_en || "-"}</td>
                  <td className="sp-td-title ar-text" dir="rtl">{spec.title_ar}</td>
                  <td className="sp-td-desc">{spec.description_fr || "-"}</td>
                  <td>
                    <span className={`sp-status-badge ${spec.active ? "active" : "inactive"}`}>
                      {spec.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td>
                    <div className="sp-table-actions">
                      <button className="sp-edit-action" onClick={() => handleOpenEditModal(spec)}>
                        Modifier
                      </button>
                      <button className="sp-delete-action" onClick={() => handleDelete(spec.id)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="sp-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="sp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <h3>{editingSpecialty ? "Modifier la spécialité" : "Ajouter une spécialité"}</h3>
              <button className="sp-close-modal" onClick={() => setModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="sp-modal-form">
              <div className="sp-modal-fields-row">
                <div className="sp-modal-field">
                  <label>Titre (FR)</label>
                  <input
                    type="text"
                    value={form.title_fr}
                    onChange={(e) => setForm({ ...form, title_fr: e.target.value })}
                    required
                    placeholder="Chirurgie viscérale"
                  />
                </div>
                <div className="sp-modal-field">
                  <label>Titre (AR)</label>
                  <input
                    type="text"
                    value={form.title_ar}
                    onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                    required
                    dir="rtl"
                    placeholder="الجراحة الباطنية"
                  />
                </div>
                <div className="sp-modal-field">
                  <label>Titre (EN)</label>
                  <input
                    type="text"
                    value={form.title_en}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    required
                    placeholder="Visceral surgery"
                  />
                </div>
              </div>

              <div className="sp-modal-field">
                <label>Description (FR)</label>
                <textarea
                  value={form.description_fr}
                  onChange={(e) => setForm({ ...form, description_fr: e.target.value })}
                  rows={3}
                  placeholder="Description en français..."
                />
              </div>

              <div className="sp-modal-field">
                <label>Description (EN)</label>
                <textarea
                  value={form.description_en}
                  onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                  rows={3}
                  placeholder="Description in English..."
                />
              </div>

              <div className="sp-modal-field">
                <label>Description (AR)</label>
                <textarea
                  value={form.description_ar}
                  onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                  rows={3}
                  dir="rtl"
                  placeholder="الوصف باللغة العربية..."
                />
              </div>

              <div className="sp-modal-fields-row">
                <div className="sp-modal-field">
                  <label>Ordre d'affichage</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="sp-modal-field-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                    <span>Actif (visible sur le site)</span>
                  </label>
                </div>
              </div>

              <div className="sp-modal-actions">
                <button type="button" className="sp-cancel-btn" onClick={() => setModalOpen(false)}>
                  Annuler
                </button>
                <button type="submit" className="sp-save-btn" disabled={saving}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
