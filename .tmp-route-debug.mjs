
    import { nav } from './route.js';
    import { lnk } from '../../../short.js';
    import { banner } from '../../app.js';

    export function menu() {
        const flds = [
            {name: 'home'},
            {name: 'products'},
            {name: 'services'}
        ];
        return nav(flds);
    }

    export default { lnk, menu, nav, banner };