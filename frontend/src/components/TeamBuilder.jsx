import React, { useState, useEffect } from 'react';

function TeamBuilder({ user }) {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roles, setRoles] = useState('');
  
  const [applyRole, setApplyRole] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/teams');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const requiredRolesArray = roles.split(',').map(r => r.trim()).filter(r => r);
    
    try {
      const res = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: user._id,
          title,
          description,
          requiredRoles: requiredRolesArray
        })
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setRoles('');
        setShowForm(false);
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (postId) => {
    const role = applyRole[postId] || '';
    if (!role) return alert('Please specify the role you are applying for.');

    try {
      const res = await fetch(`http://localhost:5000/api/teams/${postId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, role })
      });
      if (res.ok) {
        alert('Applied successfully!');
        setApplyRole({ ...applyRole, [postId]: '' });
        fetchPosts();
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="team-builder-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Team Builder Board</h2>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create a Post'}
        </button>
      </div>

      {showForm && (
        <div className="panel" style={{ marginBottom: '2rem' }}>
          <h3>Create Recruitment Post</h3>
          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <label>Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Need frontend dev for 24-hr Hackathon" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" required />
            </div>
            <div className="form-group">
              <label>Required Roles (comma separated)</label>
              <input value={roles} onChange={e => setRoles(e.target.value)} placeholder="e.g. UI Designer, React Developer" required />
            </div>
            <button type="submit" className="btn-success">Post to Board</button>
          </form>
        </div>
      )}

      <div className="posts-grid">
        {posts.map(post => {
          const isAuthor = post.author._id === user._id;
          const hasApplied = post.applicants.some(a => a.user === user._id);
          
          return (
            <div key={post._id} className="panel post-card">
              <h3>{post.title}</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                Posted by <strong>{post.author.name}</strong>
              </p>
              <p>{post.description}</p>
              
              <div style={{ marginTop: '1rem' }}>
                <strong>Looking for: </strong>
                <div className="skill-list" style={{ marginTop: '0.5rem' }}>
                  {post.requiredRoles.map(r => <span key={r} className="skill-tag learn">{r}</span>)}
                </div>
              </div>

              {!isAuthor && !hasApplied && (
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                  <input 
                    placeholder="Role to apply for..." 
                    value={applyRole[post._id] || ''} 
                    onChange={e => setApplyRole({...applyRole, [post._id]: e.target.value})}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button className="btn-primary" style={{ width: 'auto' }} onClick={() => handleApply(post._id)}>
                    Apply
                  </button>
                </div>
              )}
              
              {!isAuthor && hasApplied && (
                <p style={{ marginTop: '1.5rem', color: '#10b981', fontWeight: 'bold' }}>✓ You have applied</p>
              )}

              {isAuthor && (
                <div style={{ marginTop: '1.5rem', background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
                  <h4>Applicants ({post.applicants.length})</h4>
                  {post.applicants.map((a, i) => (
                    <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                      Participant interested as <strong>{a.role}</strong> (Status: {a.status})
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {posts.length === 0 && <p>No team building posts available currently.</p>}
      </div>
    </div>
  );
}

export default TeamBuilder;
