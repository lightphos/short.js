<head>
    <meta charset="UTF-8">
    <title>Short Div Example</title>
    <!-- <style src="./style-o.css"></style> -->
</head>
    
    <div id="short">
       <h1>short work</h1>
       <cmp></cmp>
       <p>para</p>
       <cmp></cmp>
       <h2>btn</h2>
       <bcmp></bcmp>
    </div>

<script type="module">
    function cmp(sh) { 
        return `
        <div>
            <h1>short injected</h1>
            ${sh.txt('hi ')}
            ${sh.lnk({ref:'/home', txt:'home'})}
            <bcmp/>
        </div>`;
    }


    function bcmp(sh) {
        return `
        <div>
            ${sh.btn({txt: 'btn'})}
        </div>`;
    }

    return { cmp, bcmp };
</script>

