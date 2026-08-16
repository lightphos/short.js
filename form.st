<head>
    <meta charset="UTF-8" />
    <title>Form Example</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="../style-o.css" rel="stylesheet" />
</head>

<body>
    <form class="frm-sh">
        <h2 class="hdr-sh">Sign In</h2>
        <usr></usr>
        <pwd></pwd>
        <sub></sub>
        <br>
        <button>Sign Up</button>
    <!-- <p>${sh.lnk({ref:"/pg/signup", txt:"sign up"})}</p> -->
    </form>
    <form class="frm-sh">
        <h2 class="hdr-sh">Sign Up</h2>
        <usr></usr>
        <pwd></pwd>
        <cpwd></cpwd>
        <sub></sub>
        <br>
        Sign In
    <!-- <p>${sh.lnk({ref:"/pg/signup", txt:"sign up"})}</p> -->
    </form>
</body>


<script type="module">
    function usr(sh) { 
        return `<p>${sh.inp({lbl: 'Username', ph: 'username'})}</p>`;
    }

    function pwd(sh) {
        return `<p>${sh.inp({lbl: 'Password', ph: 'password', ty: 'password'})}</p>`;
    }

    function cpwd(sh) {
        return `<p>${sh.inp({lbl: 'Confirm', ph: 'password', ty: 'password'})}</p>`;
    }

    function sub(sh) {
        return `${sh.btn({txt:"submit", clk:"/", cls: "btn-sh"})}`
    }

    return {
        usr, pwd, cpwd, sub
    };
</script>

