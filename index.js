// Set copyright year to current
let copyDate = new Date().getFullYear();
$("#footerDate").text("© " + copyDate + " Benjamin Saks");

// Toggles nav links when hamburger is clicked
$(".hamburger").on("click", () => {
  $(".header-nav").slideToggle();
});

$(window).on("resize", () => {
  const windowWidth = $(window).width();
  const headerNav = $(".header-nav");
  if (windowWidth >= 768 && headerNav.is(":hidden")) {
    headerNav.show();
  }
});
