// assets
import { IconKey, IconUsers, IconFileImport } from '@tabler/icons-react';

// constant
const icons = {
  IconKey, IconUsers, IconFileImport
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
          requiredHabilitation: 1,
          target: false,
          breadcrumbs: false
        },
        // {
        //   id: 'listeSpec',
        //   title: 'Specification',
        //   type: 'item', 
        //   url: '/specification/listeSpec',
        //   target: false,
        //   breadcrumbs: false
        // }
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
          requiredHabilitation: 6,
          target: false,
          breadcrumbs: false
        },
        // {
        //   id: 'listeCadre',
        //   title: 'Cadre',
        //   type: 'item',
        //   url: '/utilisateur/listeCadre',
        //   requiredHabilitation: 8,
        //   target: false,
        //   breadcrumbs: false
        // },
        // {
        //   id: 'listNoneCadre',
        //   title: 'Non Cadre',
        //   type: 'item',
        //   url: '/utilisateur/listeNonCadre',
        //   requiredHabilitation: 8,
        //   target: false,
        //   breadcrumbs: false
        // },
        {
          id: 'nullType',
          title: 'Non classifier',
          type: 'item',
          url: '/utilisateur/listeNonAutoriser',
          requiredHabilitation: 6,
          target: false,
          breadcrumbs: false
        },
      ]
    },
    {
      id: 'importCSV',
      title: 'Import',
      type: 'item',
      url: '/import/importCSV',
      requiredHabilitation: 27,
      icon: icons.IconFileImport,
      breadcrumbs: false
    }

  ]
};

export default admin;
