import React, { useState, useEffect } from 'react';

function Portfolio({ user, onUpdateUser }) {
  const [bio, setBio] = useState(user.bio || '');
  const [githubLink, setGithubLink] = useState(user.githubLink || '');
  const [linkedInLink, setLinkedInLink] = useState(user.linkedInLink || '');
  const [newDomain, setNewDomain] = useState('');
  
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLink, setProjLink] = useState('');

  // Update simple fields
  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user._id}/skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, githubLink, linkedInLink })
      });
      const data = await res.json();
      onUpdateUser(data);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  // Add Technical Domain
  const handleAddDomain = async () => {
    if (!newDomain.trim() || user.technicalDomains?.includes(newDomain.trim())) return;
    const updatedDomains = [...(user.technicalDomains || []), newDomain.trim()];
    
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user._id}/skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicalDomains: updatedDomains })
      });
      const data = await res.json();
      onUpdateUser(data);
      setNewDomain('');
    } catch (err) {
      console.error(err);
    }
  };

  // Remove Technical Domain
  const handleRemoveDomain = async (domain) => {
    const updatedDomains = user.technicalDomains.filter(d => d !== domain);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user._id}/skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicalDomains: updatedDomains })
      });
      const data = await res.json();
      onUpdateUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Add Project
  const handleAddProject = async () => {
    if (!projTitle.trim()) return;
    const newProject = { title: projTitle, description: projDesc, link: projLink };
    const updatedProjects = [...(user.pastProjects || []), newProject];
    
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user._id}/skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pastProjects: updatedProjects })
      });
      const data = await res.json();
      onUpdateUser(data);
      setProjTitle('');
      setProjDesc('');
      setProjLink('');
    } catch (err) {
      console.error(err);
    }
  };

  // Remove Project
  const handleRemoveProject = async (index) => {
    const updatedProjects = user.pastProjects.filter((_, i) => i !== index);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user._id}/skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pastProjects: updatedProjects })
      });
      const data = await res.json();
      onUpdateUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="portfolio-container">
      <h2>My Digital Portfolio</h2>
      
      <div className="portfolio-grid">
        <div className="panel">
          <h3>Basic Details</h3>
          <div className="form-group">
            <label>Bio</label>
            <textarea 
              value={bio} 
              onChange={e => setBio(e.target.value)} 
              placeholder="Tell us about yourself..."
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>GitHub Link</label>
            <input 
              value={githubLink} 
              onChange={e => setGithubLink(e.target.value)} 
              placeholder="https://github.com/..." 
            />
          </div>
          <div className="form-group">
            <label>LinkedIn Link</label>
            <input 
              value={linkedInLink} 
              onChange={e => setLinkedInLink(e.target.value)} 
              placeholder="https://linkedin.com/in/..." 
            />
          </div>
          <button className="btn-primary" onClick={handleSaveProfile}>Save Details</button>
        </div>

        <div className="panel">
          <h3>Technical Domains</h3>
          <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '1rem'}}>
            e.g., Frontend Development, Machine Learning, Cybersecurity
          </p>
          <div className="skill-list">
            {user.technicalDomains?.map(d => (
              <span key={d} className="skill-tag" style={{backgroundColor: '#eef2ff', color: '#3730a3'}}>
                {d} <button onClick={() => handleRemoveDomain(d)}>×</button>
              </span>
            ))}
          </div>
          <div className="add-skill" style={{marginTop: '1rem'}}>
            <input 
              value={newDomain} 
              onChange={e => setNewDomain(e.target.value)} 
              placeholder="Add a domain..." 
            />
            <button className="btn-secondary" onClick={handleAddDomain}>Add</button>
          </div>
        </div>

        <div className="panel" style={{gridColumn: '1 / -1'}}>
          <h3>Past Projects</h3>
          <div className="projects-grid">
            {user.pastProjects?.map((proj, idx) => (
              <div key={idx} className="project-card">
                <button className="delete-btn" onClick={() => handleRemoveProject(idx)}>×</button>
                <h4>{proj.title}</h4>
                <p>{proj.description}</p>
                {proj.link && <a href={proj.link} target="_blank" rel="noreferrer">View Project</a>}
              </div>
            ))}
          </div>
          
          <div className="add-project-form" style={{marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px'}}>
            <h4>Add New Project</h4>
            <div className="form-group">
              <input value={projTitle} onChange={e => setProjTitle(e.target.value)} placeholder="Project Title" />
            </div>
            <div className="form-group">
              <input value={projDesc} onChange={e => setProjDesc(e.target.value)} placeholder="Short Description" />
            </div>
            <div className="form-group">
              <input value={projLink} onChange={e => setProjLink(e.target.value)} placeholder="Project Link (optional)" />
            </div>
            <button className="btn-secondary" onClick={handleAddProject}>Add Project</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
