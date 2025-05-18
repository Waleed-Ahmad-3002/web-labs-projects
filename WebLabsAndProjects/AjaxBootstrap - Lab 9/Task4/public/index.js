document.addEventListener('DOMContentLoaded', () => {
    const jobListings = document.getElementById('job-listings')
    const applyForm = document.getElementById('applyForm')
    const jobIdInput = document.getElementById('jobId')
    async function loadJobs() {
        const response = await fetch('/api/jobs')
        if (!response.ok) throw new Error('Failed to fetch jobs')
        const jobs = await response.json()
        jobListings.innerHTML = ''
        jobs.forEach(job => {
            const card = document.createElement('div')
            card.className = 'col-md-4 mb-3'
            card.innerHTML = `
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">${job.title}</h5>
              <p class="card-text">${job.description}</p>
              <button class="btn btn-primary apply-btn" data-job-id="${job.id}">Apply Now</button>
            </div>
          </div>
        `
            jobListings.appendChild(card)
        })
        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                jobIdInput.value = e.target.getAttribute('data-job-id')
                new bootstrap.Modal(document.getElementById('applyModal')).show()
            })
        })
    }
    applyForm.addEventListener('submit', async e => {
        e.preventDefault()
        const job_id = jobIdInput.value
        const name = document.getElementById('applicantName').value.trim()
        const email = document.getElementById('applicantEmail').value.trim()
        const resume_link = document.getElementById('resumeLink').value.trim()
        if (!name || !email || !resume_link) return alert('All fields are required')
        const response = await fetch('/api/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ job_id, name, email, resume_link })
        })
        if (!response.ok) return alert('Failed to submit application')
        alert('Application submitted successfully')
        applyForm.reset()
        bootstrap.Modal.getInstance(document.getElementById('applyModal')).hide()
    })
    loadJobs()
})
