import React, { useEffect, useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';
import {
  User,
  FileText,
  Building2,
  GraduationCap,
  Lightbulb,
  X,
  ImageIcon,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const UPLOAD_ENDPOINT = `${API_BASE}/api/upload-image`;

const ProfileForm = ({ initialData, onSuccess, onCancel }) => {
  const { createProfile, updateProfile } = useProfile();
  const { user } = useAuth();
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    summary: initialData?.summary || '',
    headline: initialData?.headline || '',
    photoUrl: initialData?.photoUrl || '',
    institution: initialData?.institution || '',
    experiences: initialData?.experiences || [],
    educations: initialData?.educations || [],
    skills: initialData?.skills || [],
    accomplishments: initialData?.accomplishments || [],
    stats: initialData?.stats || { posts: 0, followers: 0, following: 0 },
    niveauEtude: initialData?.niveauEtude || '',
    specialite: initialData?.specialite || '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialData?.photoUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setPhotoPreview(localPreviewUrl);
  };

  const getToken = () => {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('jwt')
    );
  };

  const uploadImageToBackend = async (file) => {
    const token = getToken();

    if (!token) {
      throw new Error("Token introuvable. L'utilisateur n'est pas connecté ou le token n'est pas stocké dans localStorage.");
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const response = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: uploadFormData,
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(`Upload failed (${response.status}): ${rawText}`);
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`Backend did not return JSON: ${rawText}`);
    }

    const uploadedUrl = data.url || data.path || data.imageUrl || data.photoUrl;
    if (!uploadedUrl) {
      throw new Error('Upload succeeded but no image URL was returned by backend.');
    }

    return uploadedUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let finalPhotoUrl = formData.photoUrl;

      if (selectedFile) {
        finalPhotoUrl = await uploadImageToBackend(selectedFile);
      }

      const payload = {
        ...formData,
        photoUrl: finalPhotoUrl,
        summary: formData.summary.trim(),
        headline: formData.headline.trim(),
        institution: formData.institution.trim(),
        niveauEtude: formData.niveauEtude.trim(),
        specialite: formData.specialite.trim(),
      };

      if (isEditing) {
        await updateProfile(payload);
      } else {
        await createProfile(payload);
      }

      onSuccess?.();
    } catch (err) {
      setError(err?.message || err?.response?.data || "Echec de l'enregistrement du profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-form-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <h2 className="profile-form-title" style={{ marginBottom: 0 }}>
          {isEditing ? 'Modifier votre profil' : 'Creer votre profil'}
        </h2>

        {onCancel && (
          <button
            type="button"
            className="btn-icon"
            onClick={onCancel}
            aria-label="Fermer le formulaire"
          >
            <X size={18} strokeWidth={2} />
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16, marginLeft: 0, marginRight: 0 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-field">
          <label htmlFor="pf-headline">
            <User size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Titre
          </label>
          <input
            id="pf-headline"
            type="text"
            name="headline"
            value={formData.headline}
            onChange={handleChange}
            placeholder="ex : Etudiant en Master 2 a la Sorbonne · Developpeur Full-Stack"
          />
        </div>

        <div className="form-field">
          <label htmlFor="pf-summary">
            <FileText size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Resume
          </label>
          <textarea
            id="pf-summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="Ecrivez une courte bio sur votre parcours, vos competences et vos objectifs…"
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="pf-photo">
              <ImageIcon size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Photo
            </label>

            <input
              id="pf-photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />

            {photoPreview && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={photoPreview}
                  alt="Apercu"
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid var(--c-border)',
                    display: 'block',
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="pf-institution">
              <Building2 size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Etablissement
            </label>
            <input
              id="pf-institution"
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="Sorbonne Universite"
            />
          </div>
        </div>

        {user?.role === 'ETUDIANT' && (
          <div className="form-field">
            <label htmlFor="pf-niveau">
              <GraduationCap size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Niveau d'étude
            </label>
            <input
              id="pf-niveau"
              type="text"
              name="niveauEtude"
              value={formData.niveauEtude}
              onChange={handleChange}
              placeholder="Master 2 Informatique"
            />
          </div>
        )}

        {user?.role === 'ENSEIGNANT' && (
          <div className="form-field">
            <label htmlFor="pf-specialite">
              <Lightbulb size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Specialite
            </label>
            <input
              id="pf-specialite"
              type="text"
              name="specialite"
              value={formData.specialite}
              onChange={handleChange}
              placeholder="Intelligence Artificielle"
            />
          </div>
        )}

        <div className="form-actions" style={{ marginTop: 20 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Enregistrement…' : isEditing ? 'Mettre a jour le profil' : 'Creer le profil'}
          </button>

          {onCancel && (
            <button type="button" className="btn btn-cancel" onClick={onCancel}>
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;