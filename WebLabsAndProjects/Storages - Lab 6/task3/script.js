document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById('submitAnswer');
    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            const ans = document.querySelector('input[name="answer"]:checked');
            if (ans) {
                sessionStorage.setItem('answer', ans.value);
                window.location.href = 'result.html';
            } else {
                alert('Please select an answer.');
            }
        });
    }
    const userAnswerEl = document.getElementById('userAnswer');
    if (userAnswerEl) {
        userAnswerEl.textContent = sessionStorage.getItem('answer') || "No answer submitted";
    }
});
