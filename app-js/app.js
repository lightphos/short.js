import { header } from './header.js';
import { footer } from './footer.js';
import { content } from './content.js';

export function app() { 
    return (
        header({ txt: "Short.JS" }) +
        content({ txt: "Contact Form" }) +
        footer({ txt: "App Footer" })   
    );
}
