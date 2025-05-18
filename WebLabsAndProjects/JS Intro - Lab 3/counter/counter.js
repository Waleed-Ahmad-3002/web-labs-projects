let count = 0;
const counter = document.getElementById('counter');
document.getElementById('increase').onclick = () => counter.textContent = ++count;
document.getElementById('decrease').onclick = () => counter.textContent = count > 0 ? --count : 0;
