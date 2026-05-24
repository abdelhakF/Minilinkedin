import React from 'react';
import {
  ArrowUpRight,
  BellRing,
  MessageSquare,
  Send,
  UsersRound,
} from 'lucide-react';
import { useNetwork } from '../../hooks/useNetwork';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../Common/Navbar';
import InviteForm from './InviteForm';
import InvitationsReceived from './InvitationsReceived';
import InvitationsSent from './InvitationsSent';
import ConnectionsList from './ConnectionsList';
import MessagingPanel from './MessagingPanel';
import './NetworkPage.css';

const formatRoleLabel = (role) => {
  if (!role || typeof role !== 'string') {
    return 'Compte actif';
  }

  const raw = role.startsWith('ROLE_') ? role.slice('ROLE_'.length) : role;
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');

  if (!normalized) {
    return 'Compte actif';
  }

  return normalized
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const NetworkPage = () => {
  const {
    loading,
    error,
    invitationsRecues,
    invitationsEnvoyees,
    connexions,
    totalUnreadCount,
  } = useNetwork();
  const { user } = useAuth();

  const stats = [
    {
      icon: UsersRound,
      label: 'Connexions',
      value: connexions.length,
      tone: 'blue',
    },
    {
      icon: BellRing,
      label: 'Recues',
      value: invitationsRecues.length,
      tone: 'amber',
    },
    {
      icon: Send,
      label: 'Envoyees',
      value: invitationsEnvoyees.length,
      tone: 'teal',
    },
    {
      icon: MessageSquare,
      label: 'Messages recus',
      value: totalUnreadCount,
      tone: 'slate',
    },
  ];

  if (loading) {
    return (
      <div className="network-shell">
        <Navbar />
        <div className="network-content">
          <div className="network-loading">
            <div className="network-loading__hero" />
            <div className="network-loading__grid">
              <div className="network-loading__panel" />
              <div className="network-loading__panel" />
              <div className="network-loading__panel" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="network-shell">
      <Navbar />

      <div className="network-content">
        <header className="network-hero">
          <div className="network-hero__copy">
            <span className="network-kicker">Reseau</span>
            <h1>Developpez un reseau utile, pas juste une liste de contacts.</h1>
            <p>
              Suivez vos invitations, entretenez vos connexions et gardez une
              vue claire sur votre activite relationnelle.
            </p>

            <div className="network-hero__meta">
              <div className="network-user-badge">
                <div>
                  <strong>{user?.nom || 'Utilisateur'}</strong>
                  <span>{formatRoleLabel(user?.role)}</span>
                </div>
              </div>

              <div className="network-hero__hint">
                <ArrowUpRight size={16} />
                <span>
                  {invitationsRecues.length > 0
                    ? `${invitationsRecues.length} invitation(s) a traiter`
                    : 'Aucune invitation en attente'}
                </span>
              </div>
            </div>
          </div>

          <div className="network-stat-grid">
            {stats.map((stat) => {
              const StatIcon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className={`network-stat-card network-stat-card--${stat.tone}`}
                >
                  <div className="network-stat-card__icon">
                    <StatIcon size={18} />
                  </div>
                  <span className="network-stat-card__label">{stat.label}</span>
                  <strong className="network-stat-card__value">{stat.value}</strong>
                </div>
              );
            })}
          </div>
        </header>

        {error && <div className="network-alert network-alert--error">{error}</div>}

        <div className="network-layout">
          <aside className="network-sidebar">
            <InviteForm />

            <section className="network-panel network-panel--compact">
              <div className="network-panel__header">
                <div>
                  <h2>Bonnes pratiques</h2>
                  <p>Gardez une qualite de reseau coherente.</p>
                </div>
              </div>

              <ul className="network-guidelines">
                <li>Ciblez des personnes avec un contexte academique ou metier reel.</li>
                <li>Traitez rapidement les invitations recues pour garder un flux propre.</li>
                <li>Verifiez vos demandes envoyees avant de relancer un contact.</li>
              </ul>
            </section>
          </aside>

          <main className="network-main">
            <MessagingPanel />
            <InvitationsReceived />
            <InvitationsSent />
            <ConnectionsList />
          </main>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
