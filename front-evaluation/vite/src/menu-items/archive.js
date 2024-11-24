// assets
import { IconFileZip, IconArchive } from '@tabler/icons-react';


// constant 
const icons = { IconFileZip, IconArchive };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const archive = {
  id: 'archive',
  title: 'Archive',
  type: 'group',
  children: [
    {
      id: 'archiveMyEvaluation',
      title: 'Mes évaluations',
      type: 'item',
      url: '/archive/myEvaluation',
      icon: icons.IconFileZip,
      breadcrumbs: false
    },
    {
      id: 'authentication',
      title: 'Archive',
      type: 'collapse',
      icon: icons.IconArchive,

      children: [
        {
          id: 'archiveCadre',
          title: 'Cadre',
          type: 'item',
          url: '/allEvaluation/cadre',
          target: false,
          breadcrumbs: false
        },
        {
          id: 'listeSpec',
          title: 'Non Cadre',
          type: 'item', 
          url: '/allEvaluation/nonCadre',
          target: false,
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default archive;
