import React, { useState } from 'react';
import { 
  FileImage, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

const TutorProfileForm = () => {
  const [profileData, setProfileData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      bio: ''
    },
    qualifications: [],
    subjects: [],
    experience: [],
    teachingPreferences: {
      type: 'Both',
      hourlyRate: { min: 0, max: 0 }
    },
    profilePicture: null
  });

  const [errors, setErrors] = useState({});

  const addSection = (sectionKey) => {
    const newSections = {
      qualifications: { 
        degree: '', 
        institution: '', 
        year: '' 
      },
      subjects: { 
        name: '', 
        level: 'Primary' 
      },
      experience: { 
        title: '', 
        organization: '', 
        years: 0 
      }
    };

    setProfileData(prev => ({
      ...prev,
      [sectionKey]: [...(prev[sectionKey] || []), newSections[sectionKey]]
    }));
  };

  const updateSection = (sectionKey, index, updatedData) => {
    const updatedSections = [...profileData[sectionKey]];
    updatedSections[index] = { ...updatedSections[index], ...updatedData };
    
    setProfileData(prev => ({
      ...prev,
      [sectionKey]: updatedSections
    }));
  };

  const removeSection = (sectionKey, index) => {
    const updatedSections = profileData[sectionKey].filter((_, i) => i !== index);
    
    setProfileData(prev => ({
      ...prev,
      [sectionKey]: updatedSections
    }));
  };

  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Add validation logic here
    if (!profileData.personalInfo.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Submit logic here
      console.log('Submitting Profile', profileData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Tutor Profile Management
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={profileData.personalInfo.fullName}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, fullName: e.target.value }
              }))}
              className="p-2 border rounded"
            />
            {/* Add more personal info fields */}
          </div>
        </section>

        {/* Profile Picture */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
          <div className="flex items-center">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleProfilePictureUpload}
              className="hidden"
              id="profile-picture-upload"
            />
            <label 
              htmlFor="profile-picture-upload" 
              className="flex items-center cursor-pointer"
            >
              <FileImage size={24} className="mr-2" />
              Upload Profile Picture
            </label>
            {profileData.profilePicture && (
              <img 
                src={profileData.profilePicture} 
                alt="Profile" 
                className="w-24 h-24 rounded-full ml-4 object-cover"
              />
            )}
          </div>
        </section>

        {/* Dynamically Rendered Sections */}
        {['qualifications', 'subjects', 'experience'].map(sectionKey => (
          <section key={sectionKey} className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold capitalize">
                {sectionKey}
              </h2>
              <button 
                type="button"
                onClick={() => addSection(sectionKey)}
                className="flex items-center text-green-600"
              >
                <Plus size={20} className="mr-2" />
                Add {sectionKey.slice(0, -1)}
              </button>
            </div>
            {profileData[sectionKey].map((item, index) => (
              <div 
                key={index} 
                className="border p-4 rounded mb-4 relative"
              >
                {/* Render specific inputs based on section */}
                <button 
                  type="button"
                  onClick={() => removeSection(sectionKey, index)}
                  className="absolute top-2 right-2 text-red-600"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </section>
        ))}

        {/* Submission Button */}
        <div className="flex justify-center mt-6">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-6 py-2 rounded flex items-center"
          >
            <Save size={20} className="mr-2" />
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default TutorProfileForm;