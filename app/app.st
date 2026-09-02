<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>App</title>
    <style src="../style-o.css"></style>
    <import src="./app.js"></import>
</head>

<body>    
    <div id="short">
       <h1>short work</h1>
       <cmp v="1"></cmp>

       <p>para</p>
       <cmp v="2"></cmp>

       <h2>btn</h2>

       <bcmp></bcmp>

       <br>
       <a href="user.html">User</a>

       <txt v="some text"></txt>
    </div>
</body>
</html>


<script type="module">
    function cmp({v}) { 
        return `
        <div>
            <h1>cmp ${v}</h1>
            <bcmp/>
        </div>
        `;
    }


    function bcmp() {
        return `
<button>abtn</button>
        `;
    }

    return {
        cmp,
        bcmp
    };
</script>

