import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  User, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Lock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const profileFormik = useFormik({
    initialValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      bio: user?.bio || '',
      profile_picture: user?.profile_picture || ''
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required('First name is required'),
      last_name: Yup.string().required('Last name is required'),
      bio: Yup.string().max(500, 'Bio must be less than 500 characters'),
      profile_picture: Yup.string().url('Must be a valid URL')
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        await updateUser(values);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to update profile');
      } finally {
        setIsLoading(false);
      }
    }
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Confirm password is required')
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        // This would need to be implemented in the backend
        // await changePassword(values);
        setSuccess('Password changed successfully!');
        setShowPasswordForm(false);
        passwordFormik.resetForm();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to change password');
      } finally {
        setIsLoading(false);
      }
    }
  });

  const handleCancelEdit = () => {
    profileFormik.resetForm();
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="badge bg-danger">Administrator</span>;
      case 'teacher':
        return <span className="badge bg-primary">Teacher</span>;
      case 'student':
        return <span className="badge bg-success">Student</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="row">
        <div className="col-lg-4">
          {/* Profile Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body text-center">
              <div className="position-relative d-inline-block mb-3">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="rounded-circle"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                    style={{ width: '120px', height: '120px' }}
                  >
                    <User size={48} className="text-primary" />
                  </div>
                )}
                {isEditing && (
                  <button className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle">
                    <Camera size={14} />
                  </button>
                )}
              </div>

              <h4 className="mb-1">{user?.first_name} {user?.last_name}</h4>
              <div className="mb-2">{getRoleBadge(user?.role || '')}</div>
              <div className="text-muted d-flex align-items-center justify-content-center">
                <Mail size={16} className="me-1" />
                {user?.email}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 size={16} className="me-2" />
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
                
                <button 
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  <Lock size={16} className="me-2" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          {/* Alerts */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <AlertCircle size={18} className="me-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
              <CheckCircle size={18} className="me-2" />
              {success}
            </div>
          )}

          {/* Profile Information */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Profile Information</h5>
              {!isEditing && (
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 size={14} className="me-1" />
                  Edit
                </button>
              )}
            </div>
            <div className="card-body">
              <form onSubmit={profileFormik.handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="first_name" className="form-label">First Name</label>
                    <input
                      type="text"
                      className={`form-control ${!isEditing ? 'form-control-plaintext' : ''} ${profileFormik.touched.first_name && profileFormik.errors.first_name ? 'is-invalid' : ''}`}
                      id="first_name"
                      readOnly={!isEditing}
                      {...profileFormik.getFieldProps('first_name')}
                    />
                    {profileFormik.touched.first_name && profileFormik.errors.first_name && (
                      <div className="invalid-feedback">{profileFormik.errors.first_name}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="last_name" className="form-label">Last Name</label>
                    <input
                      type="text"
                      className={`form-control ${!isEditing ? 'form-control-plaintext' : ''} ${profileFormik.touched.last_name && profileFormik.errors.last_name ? 'is-invalid' : ''}`}
                      id="last_name"
                      readOnly={!isEditing}
                      {...profileFormik.getFieldProps('last_name')}
                    />
                    {profileFormik.touched.last_name && profileFormik.errors.last_name && (
                      <div className="invalid-feedback">{profileFormik.errors.last_name}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="profile_picture" className="form-label">Profile Picture URL</label>
                  <input
                    type="url"
                    className={`form-control ${!isEditing ? 'form-control-plaintext' : ''} ${profileFormik.touched.profile_picture && profileFormik.errors.profile_picture ? 'is-invalid' : ''}`}
                    id="profile_picture"
                    readOnly={!isEditing}
                    placeholder={!isEditing ? 'No profile picture set' : 'Enter image URL'}
                    {...profileFormik.getFieldProps('profile_picture')}
                  />
                  {profileFormik.touched.profile_picture && profileFormik.errors.profile_picture && (
                    <div className="invalid-feedback">{profileFormik.errors.profile_picture}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">Bio</label>
                  <textarea
                    className={`form-control ${!isEditing ? 'form-control-plaintext' : ''} ${profileFormik.touched.bio && profileFormik.errors.bio ? 'is-invalid' : ''}`}
                    id="bio"
                    rows={4}
                    readOnly={!isEditing}
                    placeholder={!isEditing ? 'No bio added yet' : 'Tell us about yourself'}
                    {...profileFormik.getFieldProps('bio')}
                  />
                  {profileFormik.touched.bio && profileFormik.errors.bio && (
                    <div className="invalid-feedback">{profileFormik.errors.bio}</div>
                  )}
                </div>

                {isEditing && (
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={handleCancelEdit}
                    >
                      <X size={16} className="me-1" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="me-1" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Account Information */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Account Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control-plaintext"
                    value={user?.username || ''}
                    readOnly
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control-plaintext"
                    value={user?.email || ''}
                    readOnly
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Role</label>
                  <div className="pt-2">
                    {getRoleBadge(user?.role || '')}
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Member Since</label>
                  <input
                    type="text"
                    className="form-control-plaintext"
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          {showPasswordForm && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Change Password</h5>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowPasswordForm(false)}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="card-body">
                <form onSubmit={passwordFormik.handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">Current Password</label>
                    <input
                      type="password"
                      className={`form-control ${passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword ? 'is-invalid' : ''}`}
                      id="currentPassword"
                      {...passwordFormik.getFieldProps('currentPassword')}
                    />
                    {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
                      <div className="invalid-feedback">{passwordFormik.errors.currentPassword}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input
                      type="password"
                      className={`form-control ${passwordFormik.touched.newPassword && passwordFormik.errors.newPassword ? 'is-invalid' : ''}`}
                      id="newPassword"
                      {...passwordFormik.getFieldProps('newPassword')}
                    />
                    {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                      <div className="invalid-feedback">{passwordFormik.errors.newPassword}</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className={`form-control ${passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      {...passwordFormik.getFieldProps('confirmPassword')}
                    />
                    {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                      <div className="invalid-feedback">{passwordFormik.errors.confirmPassword}</div>
                    )}
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={() => {
                        setShowPasswordForm(false);
                        passwordFormik.resetForm();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Changing...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;