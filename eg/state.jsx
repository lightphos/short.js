<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Form Example</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="../style-o.css" rel="stylesheet" />
</head>

<body>
    
    <div id="short">
       <h1>short work</h1>
       <cmp></cmp>
       <p>para</p>
       <cmp></cmp>
       <h2>btn</h2>
       <bcmp></bcmp>
    </div>
</body>

<short>
    function cmp(sh) { 
        return (`
        <div>
            <h1>short injected</h1>
            ${sh.txt('hi ')}
            ${sh.lnk({ref:'/home', txt:'home'})}
            <bcmp/>
        </div>`);
    }


    function bcmp(sh) {
        return `
        <div>
            ${sh.btn({txt: 'btn'})}
        </div>`;
    }


</short>
</html>

