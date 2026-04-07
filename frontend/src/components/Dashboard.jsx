import React, { useState, useEffect } from 'react';

function Dashboard({ user, onUpdateUser }) {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [search, setSearch] = useState('');
  
  const [newTeach, setNewTeach] = useState('');
  const [newLearn, setNewLearn] = useState('');

  // Fetch data
  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, [user._id]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      // Filter out self
      setUsers(data.filter(u => u._id !== user._id));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${user._id}`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Add a skill
  const handleAddSkill = async (type) => {
    const value = type === 'teach' ? newTeach : newLearn;
    const key = type === 'teach' ? 'skillsTeach' : 'skillsLearn';
    if (!value.trim()) return;
    if (user[key].includes(value)) return;
    const updatedSkills = [...user[key], value.trim()];
    
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user._id}/skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: updatedSkills })
      });
      const data = await res.json();
      onUpdateUser(data);
      if (type === 'teach') setNewTeach('');
      else setNewLearn('');
    } catch (err) {
      console.error(err);
    }
  };

  // Remove a skill
  const handleRemoveSkill = async (type, skill) => {
    const key = type === 'teach' ? 'skillsTeach' : 'skillsLearn';
    const updatedSkills = user[key].filter(s => s !== skill);
    
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user._id}/skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: updatedSkills })
      });
      const data = await res.json();
      onUpdateUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Send request
  const sendRequest = async (receiverId) => {
    try {
      const res = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: user._id, receiver: receiverId, message: 'I would like to swap skills with you!' })
      });
      if (res.ok) {
        alert('Request sent!');
        fetchRequests();
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reply request
  const replyRequest = async (requestId, status) => {
    try {
      await fetch(`http://localhost:5000/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel/Delete request
  const cancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await fetch(`http://localhost:5000/api/requests/${requestId}`, { method: 'DELETE' });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  // Safely filter users
  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const term = search.toLowerCase();
    const teachWords = u.skillsTeach?.join(' ').toLowerCase() || '';
    const learnWords = u.skillsLearn?.join(' ').toLowerCase() || '';
    return teachWords.includes(term) || learnWords.includes(term) || u.name.toLowerCase().includes(term);
  });

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
    <div className="dashboard animate-fade-in">
      <div className="sidebar">
        <div className="panel">
          <h3>My Profile</h3>
          <p style={{marginBottom:'1rem'}}><strong>{user.name}</strong> ({user.email})</p>
          
          <h4>I can teach:</h4>
          <div className="skill-list" style={{ marginTop: '0.5rem' }}>
            {user.skillsTeach && user.skillsTeach.map(s => (
              <span key={s} className="skill-tag">
                {s} <button onClick={() => handleRemoveSkill('teach', s)}>×</button>
              </span>
            ))}
          </div>
          <div className="add-skill" style={{marginBottom:'1.5rem'}}>
            <input value={newTeach} onChange={e => setNewTeach(e.target.value)} placeholder="e.g. React" />
            <button className="btn-secondary" onClick={() => handleAddSkill('teach')}>Add</button>
          </div>

          <h4>I want to learn:</h4>
          <div className="skill-list" style={{ marginTop: '0.5rem' }}>
            {user.skillsLearn && user.skillsLearn.map(s => (
              <span key={s} className="skill-tag learn">
                {s} <button onClick={() => handleRemoveSkill('learn', s)}>×</button>
              </span>
            ))}
          </div>
          <div className="add-skill">
            <input value={newLearn} onChange={e => setNewLearn(e.target.value)} placeholder="e.g. Python" />
            <button className="btn-secondary" onClick={() => handleAddSkill('learn')}>Add</button>
          </div>
        </div>

        <div className="panel">
          <h3>Requests Received ({requests.received.length})</h3>
          {requests.received.length === 0 ? <p className="text-muted">No requests.</p> : null}
          {requests.received.map(r => (
            <div key={r._id} className="request-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p><strong>{r.sender?.name}</strong></p>
                  <p style={{fontSize:'0.8rem'}}>Status: <span className={`status-badge badge-${r.status}`}>{r.status}</span></p>
                </div>
                {r.status === 'pending' && (
                  <div className="request-actions">
                    <button className="btn-success" title="Accept" onClick={() => replyRequest(r._id, 'accepted')}>✓</button>
                    <button className="btn-danger" title="Reject" onClick={() => replyRequest(r._id, 'rejected')}>✕</button>
                  </div>
                )}
              </div>
              {r.status === 'accepted' && r.sender && <ContactCard person={r.sender} />}
            </div>
          ))}
        </div>
        
        <div className="panel">
          <h3>Requests Sent ({requests.sent.length})</h3>
          {requests.sent.length === 0 ? <p className="text-muted">No requests sent.</p> : null}
          {requests.sent.map(r => (
            <div key={r._id} className="request-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p>To: <strong>{r.receiver?.name}</strong></p>
                  <p style={{fontSize:'0.8rem'}}>Status: <span className={`status-badge badge-${r.status}`}>{r.status}</span></p>
                </div>
                {(r.status === 'pending' || r.status === 'rejected') && (
                  <button className="btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }} onClick={() => cancelRequest(r._id)}>Cancel</button>
                )}
              </div>
              {r.status === 'accepted' && r.receiver && <ContactCard person={r.receiver} />}
            </div>
          ))}
        </div>
      </div>

      <div className="main-feed">
        <div className="panel">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3>Browse Students</h3>
            <input 
              type="text" 
              placeholder="Search by skill or name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{padding:'0.5rem', borderRadius:'4px', border:'1px solid #ccc', width:'250px'}}
            />
          </div>
          
          <div style={{marginTop:'1.5rem'}} className="users-grid">
            {filteredUsers.map(u => (
              <div key={u._id} className="user-card animate-fade-in">
                <h4>{u.name}</h4>
                
                <div className="user-section">
                  <h5>Can teach:</h5>
                  <div className="skill-list" style={{marginBottom:0}}>
                    {u.skillsTeach?.length ? u.skillsTeach.map(s => <span key={s} className="skill-tag">{s}</span>) : <span style={{fontSize:'0.8rem',color:'#6b7280'}}>None</span>}
                  </div>
                </div>

                <div className="user-section">
                  <h5>Wants to learn:</h5>
                  <div className="skill-list" style={{marginBottom:0}}>
                    {u.skillsLearn?.length ? u.skillsLearn.map(s => <span key={s} className="skill-tag learn">{s}</span>) : <span style={{fontSize:'0.8rem',color:'#6b7280'}}>None</span>}
                  </div>
                </div>
                
                <div className="user-section">
                  <h5>Technical Domains:</h5>
                  <div className="skill-list" style={{marginBottom:0}}>
                    {u.technicalDomains?.length ? u.technicalDomains.map(d => <span key={d} className="skill-tag" style={{backgroundColor: '#eef2ff', color: '#3730a3'}}>{d}</span>) : <span style={{fontSize:'0.8rem',color:'#6b7280'}}>None</span>}
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  style={{marginTop:'1.5rem'}}
                  onClick={() => sendRequest(u._id)}
                >
                  Send Swap Request
                </button>
              </div>
            ))}
            {filteredUsers.length === 0 && <p>No students found matching your search.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
