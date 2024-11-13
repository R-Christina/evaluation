// assets
import { IconCalendarEvent } from '@tabler/icons-react';
import { IconFile } from '@tabler/icons-react';
import { IconTargetArrow } from '@tabler/icons-react';

// constant 
const icons = { IconCalendarEvent, IconFile, IconTargetArrow };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const evaluation = {
  id: 'evaluation',
  title: 'Evaluation',
  type: 'group',
  children: [
    {
      id: 'authentication',
      title: 'Formulaire',
      type: 'collapse',
      icon: icons.IconFile,

      children: [
        {
          id: 'Cadre',
          title: 'Cadre',
          type: 'item',
          url: '/formulaireCadre/home',
          target: false,
          breadcrumbs: false
        },
        {
          id: 'NonCadre',
          title: 'Non Cadre',
          type: 'item',
          url: '/formulaireNonCadre/home',
          target: false,
          breadcrumbs: false
        }
      ]
    },

    {
      id: 'listeEvaluation',
      title: 'Période',
      type: 'item',
      url: '/evaluation/listeEvaluation',
      icon: icons.IconCalendarEvent,
      breadcrumbs: false
    },

    {
      id: 'remplissageCadre',
      title: 'Cadre',
      type: 'item',
      url: '/evaluation/remplissage',
      icon: icons.IconTargetArrow,
      breadcrumbs: false
    },

    {
      id: 'remplissageNonCadre',
      title: 'Non Cadre',
      type: 'item',
      url: '/evaluation/RemplissageNonCadre',
      icon: icons.IconTargetArrow,
      breadcrumbs: false
    },
  ]
};

export default evaluation;
