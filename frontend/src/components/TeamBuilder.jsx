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

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this recruitment post?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${postId}`, { method: 'DELETE' });
      if (res.ok) fetchPosts();
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

  const handleWithdrawApplication = async (postId) => {
    if (!window.confirm("Are you sure you want to withdraw your application?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${postId}/applicants/${user._id}`, { method: 'DELETE' });
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplicantStatus = async (postId, applicantId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${postId}/applicants/${applicantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const ContactCard = ({ person }) => (
    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#ecfdf5', borderRadius: '4px', border: '1px solid #6ee7b7' }}>
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857' }}><strong>Contact Unlocked:</strong></p>
      <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, fontSize: '0.85rem', color: '#065f46' }}>
        <li>Email: <a href={`mailto:${person.email}`}>{person.email}</a></li>
        {person.linkedInLink && <li><a href={person.linkedInLink} target="_blank" rel="noreferrer">LinkedIn Profile</a></li>}
        {person.githubLink && <li><a href={person.githubLink} target="_blank" rel="noreferrer">GitHub Profile</a></li>}
      </ul>
    </div>
  );

  return (
    <div className="team-builder-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Team Builder Board</h2>
          <p className="text-muted">Find teammates for your next Hackathon or CTF!</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '0.8rem 1.5rem' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel Form' : '+ New Post'}
        </button>
      </div>

      {showForm && (
        <div className="panel animate-fade-in" style={{ marginBottom: '2rem', border: '2px solid var(--primary-color)' }}>
          <h3>Create Recruitment Post</h3>
          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <label>Post Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Need frontend dev for 24-hr Hackathon" required />
            </div>
            <div className="form-group">
              <label>Detailed Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" placeholder="Explain the project idea, what you want to achieve, and the specific commitment required..." required />
            </div>
            <div className="form-group">
              <label>Required Roles (comma separated)</label>
              <input value={roles} onChange={e => setRoles(e.target.value)} placeholder="e.g. UI Designer, React Developer, Data Scientist" required />
            </div>
            <button type="submit" className="btn-primary">Publish to Board</button>
          </form>
        </div>
      )}

      <div className="posts-grid">
        {posts.map(post => {
          const isAuthor = post.author._id === user._id;
          const userApplication = !isAuthor ? post.applicants.find(a => (!a.user._id && a.user === user._id) || (a.user._id === user._id)) : null;
          
          return (
            <div key={post._id} className="panel post-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ borderBottom: 'none', padding: 0, margin: 0, color: '#111827', fontSize: '1.25rem' }}>{post.title}</h3>
                {isAuthor && (
                  <button className="delete-btn" title="Delete Post" style={{ position: 'static' }} onClick={() => handleDeletePost(post._id)}>×</button>
                )}
              </div>
              
              <div className="author-badge">
                <div className="author-avatar">{post.author.name.charAt(0).toUpperCase()}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>{post.author.name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Author</p>
                </div>
              </div>

              <div style={{ margin: '1rem 0', flexGrow: 1 }}>
                <p style={{ color: '#4b5563', lineHeight: '1.5' }}>{post.description}</p>
              </div>
              
              <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem', background: '#f9fafb', padding: '0.75rem', borderRadius: '6px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase' }}>Looking For: </strong>
                <div className="skill-list" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                  {post.requiredRoles.map(r => <span key={r} className="skill-tag learn">{r}</span>)}
                </div>
              </div>

              {/* View for non-authors */}
              {!isAuthor && !userApplication && (
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                  <input 
                    placeholder="Role you want to fill..." 
                    value={applyRole[post._id] || ''} 
                    onChange={e => setApplyRole({...applyRole, [post._id]: e.target.value})}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => handleApply(post._id)}>
                    Apply
                  </button>
                </div>
              )}
              
              {!isAuthor && userApplication && (
                <div style={{ marginTop: 'auto', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                  <div className={`status-banner status-${userApplication.status}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.9rem' }}>Application Status: <strong>{userApplication.status.toUpperCase()}</strong></span>
                      {(userApplication.status === 'pending' || userApplication.status === 'rejected') && (
                        <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => handleWithdrawApplication(post._id)}>Withdraw</button>
                      )}
                    </div>
                    <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.2rem' }}>Role: {userApplication.role}</span>
                  </div>
                  {userApplication.status === 'accepted' && post.author && (
                    <ContactCard person={post.author} />
                  )}
                </div>
              )}

              {/* View for authors */}
              {isAuthor && (
                <div style={{ marginTop: 'auto', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '0.5rem' }}>Applicants ({post.applicants.length})</h4>
                  {post.applicants.length === 0 && <p style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>No applicants yet.</p>}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {post.applicants.map((a, i) => (
                      <div key={i} className="applicant-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#111827' }}>{a.user.name}</strong> 
                            <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '0.5rem' }}>wants to be</span>
                            <span style={{ display: 'inline-block', background: '#fce7f3', color: '#be185d', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: 'bold' }}>{a.role}</span>
                          </div>
                          <span className={`status-badge badge-${a.status}`}>{a.status}</span>
                        </div>
                        
                        {a.status === 'pending' && (
                          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-success" style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }} onClick={() => handleApplicantStatus(post._id, a.user._id, 'accepted')}>Accept</button>
                            <button className="btn-danger" style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }} onClick={() => handleApplicantStatus(post._id, a.user._id, 'rejected')}>Reject</button>
                          </div>
                        )}
                        {a.status === 'accepted' && a.user && (
                          <ContactCard person={a.user} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {posts.length === 0 && (
          <div className="panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ color: '#6b7280', borderBottom: 'none' }}>No Active Team Posts</h3>
            <p>Be the first to create an announcement!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamBuilder;
