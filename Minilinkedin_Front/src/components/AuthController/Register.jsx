import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';

const initialAddress = {
  streetAddress: '',
  city: '',
  state: '',
  zipcode: '',
  country: '',
};

const initialAccount = {
  accountId: '',
  password: '',
  status: 'ACTIVE',
};

const Register = () => {
  const [type, setType] = useState('ETUDIANT');

  // Champs communs
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [photoFile, setPhotoFile] = useState(null);   // fichier sélectionné
  const [photoPath, setPhotoPath] = useState('');     // chemin stocké en BD
  const [address, setAddress] = useState(initialAddress);
  const [account, setAccount] = useState(initialAccount);

  // Champ ETUDIANT uniquement
  const [niveauEtude, setNiveauEtude] = useState('');

  // Champs ENSEIGNANT uniquement
  const [specialite, setSpecialite] = useState('');
  const [diplome, setDiplome] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleAccountChange = (e) => {
    setAccount({ ...account, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setNiveauEtude('');
    setSpecialite('');
    setDiplome('');
  };

  // Quand l'utilisateur choisit un fichier, on stocke le fichier
  // et on extrait le chemin (nom du fichier) qui sera envoyé au backend
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      // On stocke le nom du fichier comme chemin en BD
      // ex: "jean.jpg" ou le chemin complet selon votre config backend
      setPhotoPath(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      type,
      nom,
      email,
      phone,
      institution,
      photo: photoPath,   // on envoie le chemin/nom du fichier, pas le fichier lui-même
      roleEnum: type,
      address,
      account,
    };

    if (type === 'ETUDIANT') {
      payload.niveauEtude = niveauEtude;
    } else {
      payload.specialite = specialite;
      payload.diplome = diplome;
      payload.estValide = false;
    }

    try {
      await authService.register(payload);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Create Account</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* ── Type de compte ── */}
        <div className="form-group">
          <label>Account Type</label>
          <select value={type} onChange={handleTypeChange} required>
            <option value="ETUDIANT">Student (Étudiant)</option>
            <option value="ENSEIGNANT">Teacher (Enseignant)</option>
          </select>
        </div>

        {/* ── Informations personnelles ── */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Jean Dupont"
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jean@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33612345678"
          />
        </div>

        <div className="form-group">
          <label>Institution</label>
          <input
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Sorbonne Université"
          />
        </div>

        {/* ── Photo : input file, chemin stocké en BD ── */}
        <div className="form-group">
          <label>Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {/* Affiche le chemin qui sera stocké en BD */}
          {photoPath && (
            <small style={{ color: '#555', marginTop: '4px', display: 'block' }}>
              Path saved: <strong>{photoPath}</strong>
            </small>
          )}
        </div>

        {/* ── Champ spécifique ETUDIANT ── */}
        {type === 'ETUDIANT' && (
          <div className="form-group">
            <label>Study Level (Niveau d'étude)</label>
            <input
              type="text"
              value={niveauEtude}
              onChange={(e) => setNiveauEtude(e.target.value)}
              placeholder="Master 2 Informatique"
              required
            />
          </div>
        )}

        {/* ── Champs spécifiques ENSEIGNANT ── */}
        {type === 'ENSEIGNANT' && (
          <>
            <div className="form-group">
              <label>Speciality (Spécialité)</label>
              <input
                type="text"
                value={specialite}
                onChange={(e) => setSpecialite(e.target.value)}
                placeholder="Intelligence Artificielle et Machine Learning"
                required
              />
            </div>
            <div className="form-group">
              <label>Diplôme</label>
              <input
                type="text"
                value={diplome}
                onChange={(e) => setDiplome(e.target.value)}
                placeholder="Doctorat en Informatique"
                required
              />
            </div>
          </>
        )}

        {/* ── Adresse ── */}
        <fieldset style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          <legend style={{ fontWeight: '600', padding: '0 8px' }}>Address</legend>

          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              name="streetAddress"
              value={address.streetAddress}
              onChange={handleAddressChange}
              placeholder="15 rue de la Paix"
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={address.city}
              onChange={handleAddressChange}
              placeholder="Paris"
            />
          </div>

          <div className="form-group">
            <label>State / Region</label>
            <input
              type="text"
              name="state"
              value={address.state}
              onChange={handleAddressChange}
              placeholder="Île-de-France"
            />
          </div>

          <div className="form-group">
            <label>Zip Code</label>
            <input
              type="text"
              name="zipcode"
              value={address.zipcode}
              onChange={handleAddressChange}
              placeholder="75001"
            />
          </div>

          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={address.country}
              onChange={handleAddressChange}
              placeholder="France"
            />
          </div>
        </fieldset>

        {/* ── Credentials du compte ── */}
        <fieldset style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          <legend style={{ fontWeight: '600', padding: '0 8px' }}>Account Credentials</legend>

          <div className="form-group">
            <label>Account ID (Username)</label>
            <input
              type="text"
              name="accountId"
              value={account.accountId}
              onChange={handleAccountChange}
              placeholder="jean123"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={account.password}
              onChange={handleAccountChange}
              placeholder="monMotDePasse123"
              required
            />
          </div>
        </fieldset>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <div className="auth-links">
          <Link to="/login">Already have an account? Sign In</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;