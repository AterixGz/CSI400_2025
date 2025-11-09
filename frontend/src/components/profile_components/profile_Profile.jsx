import { useRef } from "react";

function IconUpload({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 5 17 10" />
      <line x1="12" y1="5" x2="12" y2="15" />
    </svg>
  );
}

export default function ProfileProfile({ user, profilePreview, onUpload }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border mb-6 text-center">
      <div className="relative inline-block">
        <img
          src={profilePreview || user.avatar || "/default-avatar.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover mx-auto"
        />
        <label
          htmlFor="profileUpload"
          className="absolute bottom-2 right-2 flex items-center justify-center 
             w-10 h-10 rounded-full 
             bg-slate-900/80 text-white 
             shadow-md backdrop-blur-sm 
             cursor-pointer 
             hover:scale-110 hover:bg-slate-800 
             transition-all duration-200"
          title="เปลี่ยนรูปโปรไฟล์"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2zm9 3a4 4 0 100 8 4 4 0 000-8z"
            />
          </svg>
        </label>
        <input
          type="file"
          id="profileUpload"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files[0]) onUpload(e.target.files[0]);
          }}
        />
      </div>
      <h2 className="text-lg font-semibold mt-4">{user.name}</h2>
      <p className="text-sm text-gray-500">{user.email}</p>
    </div>
  );
}
