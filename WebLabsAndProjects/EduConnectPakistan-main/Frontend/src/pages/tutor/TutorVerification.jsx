import React from 'react';
import { Info, Plus, Trash2, Save, LoaderCircle, CheckCircle } from 'lucide-react';
import { useTutorVerification } from '../../hooks/useTutorVerification';
import '../../assets/css/TutorVerification.css';

const TutorVerification = () => {
  const {
    formData,
    error,
    loading,
    existingProfile,
    handleChange,
    handleNestedChange,
    handleHourlyRateChange,
    addEntry,
    removeEntry,
    submitVerification,
    handleApply
  } = useTutorVerification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitVerification();
  };



  return (
    <div className="tutor-verification-container">
      <div className="form-wrapper">
        <div className="form-header">
          <h1>
            <Info className="header-icon" />
            Tutor Verification Profile
          </h1>
          {existingProfile && (
            <div className="verification-status">
              Status: {existingProfile.verificationStatus}
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="verification-form">
          {/* Two-column layout */}
          <div className="form-columns">
            {/* Left Column */}
            <div className="form-column left-column">
              {/* Bio Section */}
              <section className="form-section bio-section">
                <h2>Personal Bio</h2>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Share your teaching journey, expertise, and philosophy..."
                  maxLength={500}
                  rows={4}
                  required
                />
                <p className="character-count">{formData.bio.length}/500 characters</p>
              </section>

              {/* Qualifications Section */}
              <section className="form-section qualifications-section">
                <h2>Academic Qualifications</h2>
                {formData.qualifications.map((qual, index) => (
                  <div key={index} className="entry-container">
                    {formData.qualifications.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeEntry('qualifications', index)}
                        className="remove-button"
                      >
                        <Trash2 className="remove-icon" />
                      </button>
                    )}
                    <div className="grid-inputs">
                      <input type="text" name="degree" value={qual.degree} onChange={(e) => handleNestedChange('qualifications', index, e)} placeholder="Degree" required />
                      <input type="text" name="institution" value={qual.institution} onChange={(e) => handleNestedChange('qualifications', index, e)} placeholder="Institution" required />
                      <input type="number" name="year" value={qual.year} onChange={(e) => handleNestedChange('qualifications', index, e)} placeholder="Graduation Year" min={1950} max={new Date().getFullYear()} required />
                      <input type="text" name="certificate" value={qual.certificate} onChange={(e) => handleNestedChange('qualifications', index, e)} placeholder="Additional Certification (Optional)" />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addEntry('qualifications')} className="add-button">
                  <Plus className="add-icon" /> Add Qualification
                </button>
              </section>

              {/* Subjects Section */}
              <section className="form-section subjects-section">
                <h2>Subjects You Can Teach</h2>
                {formData.subjects.map((subject, index) => (
                  <div key={index} className="entry-container">
                    {formData.subjects.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeEntry('subjects', index)}
                        className="remove-button"
                      >
                        <Trash2 className="remove-icon" />
                      </button>
                    )}
                    <div className="grid-inputs">
                      <input type="text" name="name" value={subject.name} onChange={(e) => handleNestedChange('subjects', index, e)} placeholder="Subject Name" required />
                      <select name="level" value={subject.level} onChange={(e) => handleNestedChange('subjects', index, e)} required>
                        <option value="Primary">Primary</option>
                        <option value="Secondary">Secondary</option>
                        <option value="Higher Secondary">Higher Secondary</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Graduate">Graduate</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addEntry('subjects')} className="add-button">
                  <Plus className="add-icon" /> Add Subject
                </button>
              </section>
            </div>

            {/* Right Column */}
            <div className="form-column right-column">
              {/* Teaching Details Section */}
              <section className="form-section teaching-details-section">
                <h2>Teaching Details</h2>
                <div className="grid-inputs">
                  <div>
                    <label>Minimum Hourly Rate</label>
                    <input type="number" name="min" value={formData.hourlyRate.min} onChange={handleHourlyRateChange} placeholder="Minimum rate per hour" required />
                  </div>
                  <div>
                    <label>Maximum Hourly Rate</label>
                    <input type="number" name="max" value={formData.hourlyRate.max} onChange={handleHourlyRateChange} placeholder="Maximum rate per hour" required />
                  </div>
                  <div className="span-2">
                    <label>Teaching Preference</label>
                    <select name="teachingPreference" value={formData.teachingPreference} onChange={handleChange} required>
                      <option value="Online">Online</option>
                      <option value="In-person">In-person</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Experience Section */}
              <section className="form-section experience-section">
                <h2>Teaching Experience</h2>
                {formData.experience.map((exp, index) => (
                  <div key={index} className="entry-container">
                    {formData.experience.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeEntry('experience', index)}
                        className="remove-button"
                      >
                        <Trash2 className="remove-icon" />
                      </button>
                    )}
                    <div className="grid-inputs">
                      <input type="text" name="title" value={exp.title} onChange={(e) => handleNestedChange('experience', index, e)} placeholder="Job Title" required />
                      <input type="text" name="organization" value={exp.organization} onChange={(e) => handleNestedChange('experience', index, e)} placeholder="Organization" required />
                      <input type="number" name="years" value={exp.years} onChange={(e) => handleNestedChange('experience', index, e)} placeholder="Years of Experience" required />
                      <textarea name="description" value={exp.description} onChange={(e) => handleNestedChange('experience', index, e)} placeholder="Job Description" className="span-2" />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addEntry('experience')} className="add-button">
                  <Plus className="add-icon" /> Add Experience
                </button>
              </section>
            </div>
          </div>

          <div className="button-row">
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? (
                <><LoaderCircle className="spinner" /> Submitting...</>
              ) : (
                <><Save className="submit-icon" /> Submit Verification</>
              )}
            </button>
            <button type="button" onClick={handleApply} className="apply-button">
              <CheckCircle className="apply-icon" /> Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TutorVerification;