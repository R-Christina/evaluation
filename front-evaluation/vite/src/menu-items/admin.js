// assets
import { IconKey, IconUsers } from '@tabler/icons-react';

// constant
const icons = {
  IconKey, IconUsers
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const admin = {
  id: 'admin',
  title: 'Admin',
  type: 'group',
  children: [
    {
      id: 'authentication',
      title: 'Droits et accès',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'listeHabilitation',
          title: 'Habilitation',
          type: 'item',
          url: '/habilitation/listeHabilitation',
          target: false,
          breadcrumbs: false
        },
        {
          id: 'listeSpec',
          title: 'Specification',
          type: 'item', 
          url: '/specification/listeSpec',
          target: false,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'authentication',
      title: 'Utilisateur',
      type: 'collapse',
      icon: icons.IconUsers,

      children: [
        {
          id: 'listeUtilisateur',
          title: 'Utilisateur',
          type: 'item',
          url: '/utilisateur/listeUtilisateur',
          target: false,
          breadcrumbs: false
        },
        {
          id: 'listeCadre',
          title: 'Cadre',
          type: 'item',
          url: '/utilisateur/listeCadre',
          target: false,
          breadcrumbs: false
        },
        {
          id: 'listNoneCadre',
          title: 'Non Cadre',
          type: 'item',
          url: '/utilisateur/listeNonCadre',
          target: false,
          breadcrumbs: false
        },
        {
          id: 'nullType',
          title: 'Non Autoriser',
          type: 'item',
          url: '/utilisateur/listeNonAutoriser',
          target: false,
          breadcrumbs: false
        },
      ]
    },

  ]
};

export default admin;
