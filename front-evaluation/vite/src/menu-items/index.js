import dashboard from './dashboard';
// import pages from './pages';
// import utilities from './utilities';
// import other from './other';
// import bonjour from './bonjour';
import evaluation from './evaluation';
import admin from './admin'
import archive from './archive'
import manager from './manager'


// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  // items: [dashboard, pages, utilities, other, bonjour, evaluation]
  items: [admin, dashboard, evaluation, manager, archive]

};

export default menuItems;
