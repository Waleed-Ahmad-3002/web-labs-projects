const totalBillInput = document.getElementById('total-bill');
const tipPercentageInput = document.getElementById('tip-percentage');
const peopleInput = document.getElementById('people');

document.getElementById('increment').onclick = () => peopleInput.value = +peopleInput.value + 1;
document.getElementById('decrement').onclick = () => peopleInput.value = Math.max(1, +peopleInput.value - 1);

document.getElementById('calculate').onclick = () => {
    const totalBill = parseFloat(totalBillInput.value) || 0;
    const tipPercentage = parseFloat(tipPercentageInput.value) || 0;
    const people = Math.max(1, parseInt(peopleInput.value) || 1);
    const taxRate = 0.05; 

    const tip = totalBill * (tipPercentage / 100);
    const tax = totalBill * taxRate;
    const totalWithTipAndTax = totalBill + tip + tax;
    const perPerson = totalWithTipAndTax / people;

    document.getElementById('total-bill-display').textContent = `Rs.${totalBill.toFixed(2)}`;
    document.getElementById('tip-amount-display').textContent = `Rs.${tip.toFixed(2)}`;
    document.getElementById('tax-display').textContent = `Rs.${tax.toFixed(2)}`;
    document.getElementById('per-person-display').textContent = `Rs.${perPerson.toFixed(2)}`;
};
