<head>
    <meta charset="UTF-8" />
    <title>Counter Demo</title>
    <link href="../app.css" rel="stylesheet" />
</head>

<body class="bg-linear-to-br from-indigo-100 to-purple-100 min-h-screen flex items-center justify-center">
    <count inc="1"></count>
</body>

<script>
    import {count} from './count.js';

    return { count };
</script>
