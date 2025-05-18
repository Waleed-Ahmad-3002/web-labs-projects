let projects = JSON.parse(localStorage.getItem('projects')) || [];
let editingId = null;

const saveProjects = () => localStorage.setItem('projects', JSON.stringify(projects));

const renderProjects = () => {
  const searchVal = document.getElementById('search').value.toLowerCase();
  const filterStatus = document.getElementById('filterStatus').value;
  const projectList = document.getElementById('projectList');
  projectList.innerHTML = '';
  
  projects.forEach(project => {
    if ((filterStatus === 'all' || project.status === filterStatus) &&
        project.title.toLowerCase().includes(searchVal)) {
      const projectElem = document.createElement('div');
      projectElem.className = 'project';
      projectElem.innerHTML = `
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <p><strong>Status:</strong> ${project.status}</p>
        <div class="actions">
          <button class="edit" data-id="${project.id}">Edit</button>
          <button class="delete" data-id="${project.id}">Delete</button>
        </div>
      `;
      projectList.appendChild(projectElem);
    }
  });
};

document.getElementById('projectForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const status = document.getElementById('status').value;
  if (!title || !description) return;
  
  if (editingId) {
    projects = projects.map(p => p.id === editingId ? { ...p, title, description, status } : p);
    editingId = null;
    document.querySelector('#projectForm button').textContent = 'Add Project';
  } else {
    projects.push({ id: Date.now().toString(), title, description, status });
  }
  saveProjects();
  renderProjects();
  e.target.reset();
});

document.getElementById('projectList').addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() !== 'button') return;
  const id = e.target.getAttribute('data-id');
  if (e.target.classList.contains('delete')) {
    projects = projects.filter(p => p.id !== id);
    saveProjects();
    renderProjects();
  } else if (e.target.classList.contains('edit')) {
    const project = projects.find(p => p.id === id);
    if (project) {
      editingId = id;
      document.getElementById('title').value = project.title;
      document.getElementById('description').value = project.description;
      document.getElementById('status').value = project.status;
      document.querySelector('#projectForm button').textContent = 'Update Project';
    }
  }
});

document.getElementById('filterStatus').addEventListener('change', renderProjects);
document.getElementById('searchButton').addEventListener('click', renderProjects);

renderProjects();
