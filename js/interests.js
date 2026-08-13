const button = document.getElementById("saveInterests");

button.onclick = () => {

const checked = document.querySelectorAll(
'input[type="checkbox"]:checked'
);

if(checked.length===0){

alert("Please select at least one interest.");

return;

}

const interests=[];

checked.forEach(item=>{

interests.push(item.value);

});

localStorage.setItem(

"interests",

JSON.stringify(interests)

);

window.location.href="budget.html";

}
