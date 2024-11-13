import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import PrivateRoute from '../views/pages/authentication3/PrivateRoute';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard')));

// utilities routing
// const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
// const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
// const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

//admin
const ListeHabilitation = Loadable(lazy(() => import('views/admin/habilitation/ListeHabilitation')));
const AjoutHabilitation = Loadable(lazy(() => import('views/admin/habilitation/AjoutHabilitation')));
const ListeSpec = Loadable(lazy(() => import('views/admin/specification/ListeSpec')));
const AjoutSpec = Loadable(lazy(() => import('views/admin/specification/AjoutSpec')));
const ListeUtilisateur = Loadable(lazy(() => import('views/admin/utilisateur/ListeUtilisateur')));

const ListeCadre = Loadable(lazy(() => import('views/admin/utilisateur/cadre/ListeCadre')));
const AssignAllCadre = Loadable(lazy(() => import('views/admin/utilisateur/cadre/AssignAllCadre')));

const ListeNonCadre = Loadable(lazy(() => import('views/admin/utilisateur/NonCadre/ListeNonCadre')));
const AssignAllNonCadre = Loadable(lazy(() => import('views/admin/utilisateur/NonCadre/AssignAllNonCadre')));

const ListeNonAutoriser = Loadable(lazy(() => import('views/admin/utilisateur/TypeNull/NonAutoriser')));
const Autorisation = Loadable(lazy(() => import('views/admin/utilisateur/TypeNull/Autorisation')));

const Assignation = Loadable(lazy(() => import('views/admin/utilisateur/Assignation')));
const AssignationAll = Loadable(lazy(() => import('views/admin/utilisateur/AssignationAll')));

// Rh
const ListeEval = Loadable(lazy(() => import('views/rh/evaluation/Liste')));
const AjoutEval = Loadable(lazy(() => import('views/rh/evaluation/Ajout')));
const FormulaireCadre = Loadable(lazy(() => import('views/rh/formulaire/cadre/Formulaire')));
const EditFormulaireCadre = Loadable(lazy(() => import('views/rh/formulaire/cadre/EditFormCadre')));
const FormulaireNonCadre = Loadable(lazy(() => import('views/rh/formulaire/nonCadre/index')));
const EditFormulaireNonCadre = Loadable(lazy(() => import('views/rh/formulaire/nonCadre/EditFormNonCadre')));

// collab
const Remplissage = Loadable(lazy(() => import('views/collaborateur/evaluation/cadre/Remplissage')));
const RemplissageNonCadre = Loadable(lazy(() => import('views/collaborateur/evaluation/nonCadre/Remplissage')));
const MyEvaluation = Loadable(lazy(() => import('views/collaborateur/archive/MyEvaluation')));

// sample page routing
// const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: (
            <PrivateRoute>
              <DashboardDefault />
            </PrivateRoute>
          )
        }
      ]
    },

    {
      path: 'habilitation',
      children: [
        {
          path: 'listeHabilitation',
          element: <ListeHabilitation />
        }
      ]
    },

    {
      path: 'habilitation',
      children: [
        {
          path: 'ajoutHabilitation',
          element: <AjoutHabilitation />
        }
      ]
    },

    {
      path: 'specification',
      children: [
        {
          path: 'listeSpec',
          element: <ListeSpec />
        }
      ]
    },

    {
      path: 'specification',
      children: [
        {
          path: 'ajoutSpec',
          element: <AjoutSpec />
        }
      ]
    },

    {
      path: 'utilisateur',
      children: [
        {
          path: 'listeUtilisateur',
          element: <ListeUtilisateur />
        }
      ]
    },

    {
      path: 'utilisateur',
      children: [
        {
          path: 'listeCadre',
          element: <ListeCadre />
        }
      ]
    },

    {
      path: 'utilisateur',
      children: [
        {
          path: 'assignAllCadre',
          element: <AssignAllCadre />
        }
      ]
    },

    {
      path: 'utilisateur',
      children: [
        {
          path: 'listeNonCadre',
          element: <ListeNonCadre />
        }
      ]
    },

    {
      path: 'utilisateur',
      children: [
        {
          path: 'assignAllNonCadre',
          element: <AssignAllNonCadre />
        }
      ]
    },

    {
      path: 'utilisateur',
      children: [
        {
          path: 'listeNonAutoriser',
          element: <ListeNonAutoriser />
        }
      ]
    },

    {
      path: 'utilisateur',
      children: [
        {
          path: 'autorisation',
          element: <Autorisation />
        }
      ]
    },

    {
      path: 'utilisateur',
      children: [
        {
          path: 'assignation/:userId',
          element: <Assignation />
        }
      ]
    },

    {
      path: 'utilisateur',
      children: [
        {
          path: 'assignationAll',
          element: <AssignationAll />
        }
      ]
    },

    {
      path: 'evaluation',
      children: [
        {
          path: 'listeEvaluation',
          element: <ListeEval />
        }
      ]
    },

    {
      path: 'evaluation',
      children: [
        {
          path: 'ajoutEvaluation',
          element: <AjoutEval />
        }
      ]
    },

    {
      path: 'formulaireCadre',
      children: [
        {
          path: 'home',
          element: <FormulaireCadre />
        }
      ]
    },

    {
      path: 'formulaireCadre',
      children: [
        {
          path: 'edit',
          element: <EditFormulaireCadre />
        }
      ]
    },

    {
      path: 'formulaireNonCadre',
      children: [
        {
          path: 'home',
          element: <FormulaireNonCadre />
        }
      ]
    },

    {
      path: 'formulaireNonCadre',
      children: [
        {
          path: 'edit',
          element: <EditFormulaireNonCadre />
        }
      ]
    },

    //collab
    {
      path: 'evaluation',
      children: [
        {
          path: 'remplissage',
          element: <Remplissage />
        }
      ]
    },

    {
      path: 'evaluation',
      children: [
        {
          path: 'remplissageNonCadre',
          element: <RemplissageNonCadre />
        }
      ]
    },

    //archive
    {
      path: 'archive',
      children: [
        {
          path: 'myEvaluation',
          element: <MyEvaluation />
        }
      ]
    }

    // {
    //   path: 'utils',
    //   children: [
    //     {
    //       path: 'util-typography',
    //       element: <UtilsTypography />
    //     }
    //   ]
    // },

    // {
    //   path: 'utils',
    //   children: [
    //     {
    //       path: 'util-color',
    //       element: <UtilsColor />
    //     }
    //   ]
    // },

    // {
    //   path: 'utils',
    //   children: [
    //     {
    //       path: 'util-shadow',
    //       element: <UtilsShadow />
    //     }
    //   ]
    // },

    // {
    //   path: 'sample-page',
    //   element: <SamplePage />
    // }
  ]
};

export default MainRoutes;
