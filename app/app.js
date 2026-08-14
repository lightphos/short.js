import { header } from './header.js';
import { footer } from './footer.js';
import { content } from './content.js';

export function app() { 
    return (
        header({ children: "App Heading" }) +
        content({ children: "Content" }) +
        footer({ children: "App Footer" })   
    );
}
