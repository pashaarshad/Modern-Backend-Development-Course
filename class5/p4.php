<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<style>
    .div{
        width: 200px;
        height: 200px;
        background-color: red;
    }
  *{
    margin: 0;
    padding: 0;
    blackground-color: black;
  }
</style>


<body>
    <div class="div">
        BOX
    </div>

<?php
echo "Welcome to PHP programming!";

for ($i = 0; $i <= 5; $i++) {
    echo "The number of PHP is: $i <br>";
}
?>

<script>
    for (let i = 0; i <= 5; i++) {
        
        document.write("The number of JS is: " + i + "<br>");
    }
 </script>
</body>
</html>