// get button and message
const button = document.getElementById("btn");
const message = document.getElementById("message");

// when button is clicked
button.addEventListener("click", function () {
    message.textContent = "Nice! JavaScript is working 🎉";
});
