function setCookie(n, v, d) { let e = new Date(); e.setTime(e.getTime() + d * 864e5); 
document.cookie = n + "=" + v + ";expires=" + e.toUTCString() + ";path=/" }
function getCookie(n) { let m = document.cookie.match('(^|;)\\s*' + n + '=([^;]+)'); return m ? m[2] : "" }
function addToCart(p) {
    let c = getCookie("cart"), a = c ? c.split(",") : [];
    if (!a.includes(p)) { a.push(p); setCookie("cart", a.join(","), 7); alert(p + " added to cart."); }
}
function displayCart() {
    let a = getCookie("cart").split(",").filter(Boolean), ul = document.getElementById("cart"); ul.innerHTML = "";
    a.forEach(p => {
        let li = document.createElement("li"); li.textContent = p;
        let btn = document.createElement("button"); btn.textContent = "Remove";
        btn.onclick = () => { removeFromCart(p); displayCart(); };
        li.appendChild(btn); ul.appendChild(li);
    });
}
function removeFromCart(p) {
    let a = getCookie("cart").split(",").filter(Boolean);
    a = a.filter(x => x !== p); setCookie("cart", a.join(","), 7);
}
