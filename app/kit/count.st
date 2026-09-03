<head>
    <meta charset="UTF-8" />
    <title>Counter Demo</title>
    <link href="../app.css" rel="stylesheet" />
</head>

<body class="bg-linear-to-br from-indigo-100 to-purple-100 min-h-screen flex flex-col items-center justify-center">
    <back></back>
    <count inc="1"></count>
</body>

<script>
    import {back} from '../app.js';
    import {count} from './count.js';

    return { back, count };
</script>
