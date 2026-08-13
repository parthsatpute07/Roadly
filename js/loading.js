const loadingText = document.getElementById("loadingText");
const progressBar = document.getElementById("progressBar");

const steps = [

"🗺️ Finding the best route...",
"🌤️ Checking live weather...",
"📍 Discovering top attractions...",
"🍽️ Finding nearby restaurants...",
"🏨 Finding great hotels...",
"⛽ Calculating fuel costs...",
"💰 Estimating your budget...",
"🤖 Generating your AI itinerary...",
"✅ Trip Ready!"

];

let index = 0;

function updateLoading(){

loadingText.textContent = steps[index];

progressBar.style.width = ((index + 1) / steps.length * 100) + "%";

index++;

if(index < steps.length){

setTimeout(updateLoading,700);

}else{

setTimeout(()=>{

window.location.href="dashboard.html";

},900);

}

}

updateLoading();
