import { useRef } from "react";

function IconUpload({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 5 17 10" />
      <line x1="12" y1="5" x2="12" y2="15" />
    </svg>
  );
}

export default function ProfileProfile({ user, profilePreview, onUpload }) {
  const fileRef = useRef(null);

  const handleUploadClick = () => fileRef.current && fileRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) onUpload(file);
  };

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex flex-col items-center">
        <div className="w-36 h-36 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center mb-4">
          {profilePreview ? (
            <img src={profilePreview} alt="avatar" className="w-full h-full object-cover" />
          ) : user.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-20 h-20 text-slate-300" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">{user.name}</div>
          <div className="text-sm text-slate-500">{user.email}</div>
          <div className="text-xs text-slate-400 mt-2">Member since {user.memberSince}</div>
        </div>

        <div className="w-full mt-5">
          <input 
            ref={fileRef} 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />
          <button 
            onClick={handleUploadClick} 
            className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-slate-200 rounded-md px-3 py-2 text-sm hover:bg-slate-50"
          >
            <IconUpload className="w-4 h-4" /> Upload New Photo
          </button>
        </div>
      </div>
    </div>
  );
}