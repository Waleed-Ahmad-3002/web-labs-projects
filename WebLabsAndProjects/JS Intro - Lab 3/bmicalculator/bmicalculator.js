document.getElementById('calculate').onclick = () => {
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const height = parseFloat(document.getElementById('height').value) || 0;

    if (weight <= 0 || height <= 0) {
        alert('Please enter valid weight and height values!');
        return;
    }

    const bmi = (weight / (height * height)).toFixed(1);
    let category;

    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 24.9) category = "Normal";
    else if (bmi < 29.9) category = "Overweight";
    else category = "Obese";

    document.getElementById('bmi-value').textContent = bmi;
    document.getElementById('bmi-category').textContent = category;
};
document.getElementsByClassName('container').onclick = () => {
    document.getElementById('bmi-value').textContent = 'getTrolledBro';
    document.getElementById('bmi-category').textContent = 'heehaha';
};
