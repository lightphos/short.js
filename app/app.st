<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Short App</title>
    <style src="./app.css"></style>
</head>

<body class="bg-gradient-to-br from-indigo-100 to-purple-100 min-h-screen">
    <div id="short" class="max-w-2xl mx-auto p-8">
       <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">Short App</h1>

       <div class="flex flex-col gap-6">
           <cmp v="one"></cmp>
           <cmp v="two"></cmp>
       </div>

       <div class="mt-8 text-center">
           <bcmp v="Click me" class=""></bcmp>
       </div>

       <div class="mt-6 flex flex-wrap gap-4 justify-center">
           <stxt v="some text"></stxt>
           <mtxt v="some more text"></mtxt>
       </div>

       <nav class="mt-10 flex gap-4 justify-center">
           <a href="./cmp/user.html" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">User</a>
           <a href="./cmp/form.html" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">Form</a>
           <a href="./kit/count.html" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">Count</a>
       </nav>

    </div>
ß
</body>

</html>

<script type="module">
    import { stxt, mtxt, bcmp, cmp } from './app.js';
    return {
        stxt, mtxt, bcmp, cmp
    };
</script>
