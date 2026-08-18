<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Form Example</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="../style-o.css" rel="stylesheet" />
</head>

<body>
    <form class="frm-sh">
        <h2 class="hdr-sh">Sign In</h2>
        <usr nm="User"></usr>
        <pwd></pwd>
        <sub></sub>
        <p>
            <lnk rf="/signup" txt="sign up"></lnk>
        </p>
        <button type="button" onClick='own()' class='btn-sh'>Click</button>
    </form>

    <form class="frm-sh">
        <h2 class="hdr-sh">Sign Up</h2>
        <usr nm="new user"></usr>
        <pwd></pwd>
        <cpwd></cpwd>
        <sub></sub>
        <p>
            <lnk rf="/signin" txt="sign in"></lnk>
        </p>
    </form>
</body>
<script>
    function own() {alert('ooh!')}
</script>

<short>
    // @ts-ignore
   
    import * as sh from '../short.js';
    
    function lnk({ rf, txt }) { 
      return (
      <a href={rf}>{txt}</a>
      );
    }

    function usr({ nm }) { 
      return (
       <p><label>{nm}&nbsp;  
        <input type="text" placeholder="username" /></label>
       </p> 
       );
    }

    function pwd() { 
        return `<p>${sh.inp({ lbl: 'Password', ph: 'password', ty: 'password' })}</p>`;
    }

    function cpwd() { 
        return `<p>${sh.inp({ lbl: 'Confirm', ph: 'password', ty: 'password' })}</p>`;
    }

    function sub() { 
        return sh.btn({ txt: "submit", clk: "/", cls: "btn-sh" }); 
    }

</short>
</html>
