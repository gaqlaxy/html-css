console.log("heloo world");

let myName = "Prakash";
let h1 = document.querySelector(".heading-primary");
console.log(myName);
console.log(h1);

// h1.addEventListener("click", function(){

//     h1.textContent= myName;
//     h1.style.backgroundColor = "red";
//     h1.style.padding = "5rem";
    
// })
// Getting current year 
let year = document.querySelector(".year");
let currentYear = new Date().getFullYear();
console.log(currentYear)
year.textContent = currentYear;

// Mobile Nav 

let btnNav = document.querySelector(".btn-mobile-nav");
let headerNav = document.querySelector(".header");

btnNav.addEventListener("click", function(){
  headerNav.classList.toggle("nav-open");
})

//Smooth Scrolling

let allLinks = document.querySelectorAll("a:link");

allLinks.forEach(function(link){
  link.addEventListener("click", function(e){
    e.preventDefault();
    let href = link.getAttribute("href");

    // scrolling back to top

    if(href ==="#") 
      window.scrollTo({
      top: 0,
      behavior:"smooth"
    });
    if(href !=="#" && href.startsWith("#")){
      let sectionEl = document.querySelector(href);
      sectionEl.scrollIntoView({behavior: "smooth"});
    }
    // CLosing mobile nav 
    if(link.classList.contains("main-nav-link"))
  headerNav.classList.toggle("nav-open");
  });
})

// Sticky Navigation

let sectionHeroEl = document.querySelector(".section-hero");
let obs = new IntersectionObserver(function(entries){
  let ent = entries[0]; 
  console.log(ent); 
  if(ent.isIntersecting === false){

    document.body.classList.add("sticky");
  }
  if(ent.isIntersecting === true){

    document.body.classList.remove("sticky");
  }
}, 
{
  root: null,
  threshold: 0,
  rootMargin: "-80px"
})
obs.observe(sectionHeroEl);




///////////////////////////////////////////////////////////
// Fixing flexbox gap property missing in some Safari versions
function checkFlexGap() {
    var flex = document.createElement("div");
    flex.style.display = "flex";
    flex.style.flexDirection = "column";
    flex.style.rowGap = "1px";
  
    flex.appendChild(document.createElement("div"));
    flex.appendChild(document.createElement("div"));
  
    document.body.appendChild(flex);
    var isSupported = flex.scrollHeight === 1;
    flex.parentNode.removeChild(flex);
    console.log(isSupported);
  
    if (!isSupported) document.body.classList.add("no-flexbox-gap");
  }
  checkFlexGap();
  
  // https://unpkg.com/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js
  
  /*
  .no-flexbox-gap .main-nav-list li:not(:last-child) {
    margin-right: 4.8rem;
  }
  
  .no-flexbox-gap .list-item:not(:last-child) {
    margin-bottom: 1.6rem;
  }
  
  .no-flexbox-gap .list-icon:not(:last-child) {
    margin-right: 1.6rem;
  }
  
  .no-flexbox-gap .delivered-faces {
    margin-right: 1.6rem;
  }
  
  .no-flexbox-gap .meal-attribute:not(:last-child) {
    margin-bottom: 2rem;
  }
  
  .no-flexbox-gap .meal-icon {
    margin-right: 1.6rem;
  }
  
  .no-flexbox-gap .footer-row div:not(:last-child) {
    margin-right: 6.4rem;
  }
  
  .no-flexbox-gap .social-links li:not(:last-child) {
    margin-right: 2.4rem;
  }
  
  .no-flexbox-gap .footer-nav li:not(:last-child) {
    margin-bottom: 2.4rem;
  }
  
  @media (max-width: 75em) {
    .no-flexbox-gap .main-nav-list li:not(:last-child) {
      margin-right: 3.2rem;
    }
  }
  
  @media (max-width: 59em) {
    .no-flexbox-gap .main-nav-list li:not(:last-child) {
      margin-right: 0;
      margin-bottom: 4.8rem;
    }
  }
  */
  