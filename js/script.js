// close sidebar
function closeNav() {
    document.getElementById('side-box').style.display = 'none';
    document.getElementsByClassName('main')[0].style.left = '0px';
    document.getElementById('menu_icon').style.display = 'block';
}

// open sidebar
function openNav() {
    const x = window.matchMedia("(max-width: 250px)");
    document.getElementById('side-box').style.display = 'block';
    document.getElementById('menu_icon').style.display = 'none';
    if (x.matches) { // If media query matches
        document.getElementsByClassName('main')[0].style.left = '200px';
    }else {
        document.getElementsByClassName('main')[0].style.left = '310px';
    }
}