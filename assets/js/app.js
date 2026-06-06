/* =====================================
   HANEM BOUTIQUE
   PREMIUM ANIMATION SYSTEM
===================================== */

/* Reveal Elements */

const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add('active');

}

});

},{
threshold:.15
});

reveals.forEach(el=>observer.observe(el));

/* Smooth Parallax */

const parallaxItems =
document.querySelectorAll('[data-parallax]');

window.addEventListener('scroll',()=>{

const scrollY = window.scrollY;

parallaxItems.forEach(item=>{

const speed =
item.dataset.parallax || 0.2;

item.style.transform =
`translateY(${scrollY * speed}px)`;

});

});

/* Product Zoom */

const cards =
document.querySelectorAll('.product-card');

cards.forEach(card=>{

card.addEventListener('mousemove',(e)=>{

const x =
e.offsetX / card.offsetWidth - 0.5;

const y =
e.offsetY / card.offsetHeight - 0.5;

card.style.transform =
`
perspective(1000px)
rotateY(${x*10}deg)
rotateX(${y*-10}deg)
scale(1.04)
`;

});

card.addEventListener('mouseleave',()=>{

card.style.transform='';

});

});

/* Fake Notifications */

const notifications = [

"تم طلب طقم البرازيل منذ لحظات",
"عميلة من وهران أكملت الطلب",
"تبقى عدد محدود من طقم برشلونة",
"تم بيع 3 قطع خلال آخر ساعة"

];

let current = 0;

const notify =
document.querySelector('.live-notification');

if(notify){

setInterval(()=>{

notify.innerText =
notifications[current];

current++;

if(current >= notifications.length)
current = 0;

},5000);

}

/* Smooth 60fps Animation */

let lastScroll = 0;

function animationLoop(){

const scroll =
window.scrollY;

document.documentElement.style.setProperty(
'--scroll',
scroll
);

lastScroll = scroll;

requestAnimationFrame(animationLoop);

}

animationLoop();

/* Exit Intent */

let shown = false;

document.addEventListener('mouseout',e=>{

if(
!shown &&
e.clientY < 10
){

shown = true;

document
.querySelector('.exit-popup')
?.classList.add('show');

}

});

document.querySelector("#hero-title").textContent =
CONFIG.heroTitle;

document.querySelector("#hero-subtitle").textContent =
CONFIG.heroSubtitle;

document.querySelector("#cta-btn").textContent =
CONFIG.ctaText;