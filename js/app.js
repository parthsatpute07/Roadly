// ============================
// Navbar Scroll Effect
// ============================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

    if(window.scrollY>80){

        navbar.classList.add("scrolled");

    }

    else{

        navbar.classList.remove("scrolled");

    }

});

// ============================
// Counter Animation
// ============================

const counters=document.querySelectorAll(".counter");

const speed=200;

const animateCounter=(counter)=>{

    const target=+counter.dataset.target;

    const update=()=>{

        const current=+counter.innerText;

        const increment=Math.ceil(target/speed);

        if(current<target){

            counter.innerText=current+increment;

            requestAnimationFrame(update);

        }

        else{

            if(target===49){

                counter.innerHTML="4.9★";

            }

            else if(target===99){

                counter.innerHTML="99%";

            }

            else{

                counter.innerHTML=target.toLocaleString()+"+";

            }

        }

    };

    update();

};

// Run once when visible

const observer=new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            animateCounter(entry.target);

            observer.unobserve(entry.target);

        }

    });

});

counters.forEach(counter=>{

    observer.observe(counter);

});
// ===============================
// FAQ ACCORDION
// ===============================

const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(question => {

    question.addEventListener("click", () => {

        const answer = question.nextElementSibling;

        const icon = question.querySelector("span");

        if (answer.style.maxHeight) {

            answer.style.maxHeight = null;

            icon.innerHTML = "+";

        } else {

            document.querySelectorAll(".faq-answer").forEach(item => {
                item.style.maxHeight = null;
            });

            document.querySelectorAll(".faq-question span").forEach(item => {
                item.innerHTML = "+";
            });

            answer.style.maxHeight = answer.scrollHeight + "px";

            icon.innerHTML = "−";

        }

    });

});
