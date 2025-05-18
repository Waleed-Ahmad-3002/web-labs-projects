const form = document.getElementById('blog-form')
const blogsDiv = document.getElementById('blogs')
const loadBlogs = () => {
    fetch('http://localhost:3000/api/blogs')
        .then(res => res.json())
        .then(data => {
            blogsDiv.innerHTML = ''
            data.forEach(blog => {
                const card = document.createElement('div')
                card.className = 'card'
                const title = document.createElement('h3')
                title.textContent = blog.title
                const author = document.createElement('p')
                author.textContent = 'by ' + blog.author
                const excerpt = document.createElement('p')
                excerpt.textContent = blog.content.substring(0, 100) + '...'
                const readMore = document.createElement('a')
                readMore.href = `post.html?id=${blog.id}`
                readMore.textContent = 'Read More'
                card.appendChild(title)
                card.appendChild(author)
                card.appendChild(excerpt)
                card.appendChild(readMore)
                blogsDiv.appendChild(card)
            })
        })
}
form.addEventListener('submit', e => {
    e.preventDefault()
    const blog = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        content: document.getElementById('content').value
    }
    fetch('http://localhost:3000/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blog)
    })
        .then(() => {
            form.reset()
            loadBlogs()
        })
})
loadBlogs()
