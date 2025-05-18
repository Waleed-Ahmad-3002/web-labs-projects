document.addEventListener('DOMContentLoaded', () => {
    const adminJobs = document.getElementById('admin-jobs')
    async function loadJobs() {
        const response = await fetch('/api/jobs')
        if (!response.ok) throw new Error('Failed to fetch jobs')
        const jobs = await response.json()
        adminJobs.innerHTML = ''
        jobs.forEach(job => {
            const jobDiv = document.createElement('div')
            jobDiv.className = 'mb-3'
            jobDiv.innerHTML = `
          <h5>${job.title}</h5>
          <button class="btn btn-secondary view-applicants" data-job-id="${job.id}">View Applicants</button>
          <div class="applicants-table mt-2" style="display: none;">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Resume Link</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        `
            adminJobs.appendChild(jobDiv)
        })
        document.querySelectorAll('.view-applicants').forEach(btn => {
            btn.addEventListener('click', async e => {
                const jobId = e.target.getAttribute('data-job-id')
                const tbody = e.target.nextElementSibling.querySelector('tbody')
                const response = await fetch(`/api/applicants/${jobId}`)
                if (!response.ok) return tbody.innerHTML = `<tr><td colspan="3">Failed to fetch applicants</td></tr>`
                const applicants = await response.json()
                tbody.innerHTML = ''
                applicants.forEach(applicant => {
                    const tr = document.createElement('tr')
                    tr.innerHTML = `
              <td>${applicant.name}</td>
              <td>${applicant.email}</td>
              <td><a href="${applicant.resume_link}" target="_blank">View</a></td>
            `
                    tbody.appendChild(tr)
                })
                e.target.nextElementSibling.style.display = 'block'
            })
        })
    }
    loadJobs()
})
