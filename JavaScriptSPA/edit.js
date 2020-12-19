const testdiv = document.getElementById('testdiv').dataset.test;
var x;
testdiv.forEach(element => {
    x = element.name;
});
document.getElementById('testdiv').innerHTML = x;
