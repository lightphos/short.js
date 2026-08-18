<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Form Example</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="./style-o.css" rel="stylesheet" />
</head>

<body>
    
    <div id="short">
       <h1>short work really</h1>
       <cmp></cmp>
       <p>para</p>
       <cmp></cmp>
       <h2>btn</h2>
       <bcmp t='bij'></bcmp>
    </div>
</body>

<short>
    import * as sh from '../short.js';

    function cmp() { 
        return (`
        <div>
            <h1>short injected</h1>
            ${sh.txt('hi ')}
            ${sh.lnk({ref:'/home', txt:'home'})}
            ${bcmp({t: 'sij'})}
        </div>`);
    }

    function bcmp({ t }) {
        return sh.btn({ txt: t });
    }

</short>
</html>

