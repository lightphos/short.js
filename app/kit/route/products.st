
<html>

<head>
    <meta charset="UTF-8" />
    <title>Menu Example</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="../../app.css" rel="stylesheet" />
</head>


<body>
    <menu selected="products"></menu>

    <br/>
    <banner n="Products"></banner>

</body>

<script type="module">
    import { menu } from './route.js';
    import { banner } from '../../app.js';

    return { menu };
</script>
</html>