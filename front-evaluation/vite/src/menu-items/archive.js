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
    // {
    //   id: 'authentication',
    //   title: 'Formulaire',
    //   type: 'collapse',
    //   icon: icons.IconFile,

    //   children: [
    //     {
    //       id: 'Cadre',
    //       title: 'Cadre',
    //       type: 'item',
    //       url: '/formulaireCadre/home',
    //       target: false,
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'NonCadre',
    //       title: 'Non Cadre',
    //       type: 'item',
    //       url: '/formulaireNonCadre/home',
    //       target: false,
    //       breadcrumbs: false
    //     }
    //   ]
    // },

    {
      id: 'archiveMyEvaluation',
      title: 'Mes évaluations',
      type: 'item',
      url: '/archive/myEvaluation',
      icon: icons.IconFileZip,
      breadcrumbs: false
    },

    {
        id: 'archiveAllEvaluation',
        title: 'Evaluations',
        type: 'item',
        url: '/archive/myEvaluation',
        icon: icons.IconArchive,
        breadcrumbs: false
    }
  ]
};

export default archive;
