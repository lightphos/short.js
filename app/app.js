import { header } from './header.js';
import { footer } from './footer.js';
import { content } from './content.js';

export function app() { 
    return (
        header({ children: "Short.JS" }) +
        content({ children: "Content" }) +
        footer({ children: "App Footer" })   
    );
}
