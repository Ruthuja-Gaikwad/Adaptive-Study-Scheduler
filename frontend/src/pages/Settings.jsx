import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';

export function Settings() {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: 'Alex Scholar',
    email: 'alex.scholar@university.edu',
    school: 'State University'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving changes:', formData);
    alert('Changes saved successfully!');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div 
      className="min-h-screen transition-colors"
      style={{
        backgroundColor: isDarkMode ? '#111827' : '#ffffff'
      }}
    >
      {/* Header */}
      <div 
        className="border-b sticky top-0 z-10 transition-colors"
        style={{
          borderColor: isDarkMode ? '#374151' : '#e5e7eb',
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
        }}
      >
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                color: isDarkMode ? '#9ca3af' : '#6b7280'
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 
              className="text-3xl font-bold"
              style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
            >
              Account Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Display Name */}
          <div className="space-y-2">
            <label 
              htmlFor="displayName" 
              className="block text-sm font-medium"
              style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
              placeholder="Enter your display name"
              style={{
                borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                borderWidth: '1px',
                backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#f9fafb' : '#111827',
                focusOutlineColor: isDarkMode ? '#06D6A0' : '#006D77'
              }}
            />
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium"
              style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
              placeholder="Enter your email address"
              style={{
                borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                borderWidth: '1px',
                backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#f9fafb' : '#111827'
              }}
            />
          </div>

          {/* University/School */}
          <div className="space-y-2">
            <label 
              htmlFor="school" 
              className="block text-sm font-medium"
              style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
            >
              University/School
            </label>
            <input
              id="school"
              type="text"
              value={formData.school}
              onChange={(e) => handleChange('school', e.target.value)}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
              placeholder="Enter your university or school"
              style={{
                borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                borderWidth: '1px',
                backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#f9fafb' : '#111827'
              }}
            />
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <motion.button
              type="submit"
              className="w-full px-6 py-3 font-medium rounded-lg shadow-md transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                backgroundColor: isDarkMode ? '#06D6A0' : '#006D77',
                color: isDarkMode ? '#1f2937' : '#ffffff'
              }}
            >
              Save Changes
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
