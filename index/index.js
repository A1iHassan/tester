async function getData() {
  const response = await fetch("http://localhost:3000/get");
  console.log(response);
}
