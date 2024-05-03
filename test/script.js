function generate() {
  var digit = document.getElementById("digit").value;

  var x = document.getElementById("input").value;
  var regex = RegExp("^[0-9]{" + digit + "}$", "g");

  var result = Array.from(x.matchAll(regex));

  console.log(result);

  document.getElementById("output").innerHTML = result.join(";");
}
