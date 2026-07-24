"use client";

import React, { useState, useEffect } from 'react';
import { barberService } from '@/services/barber.service';

export default function BarberProfileConfigPage() {
  const [profile, setProfile] = useState({
    bio: '',
    experienceYears: 0,
    workingSince: '',
    specialties: [],
    gallery: []
  });
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await barberService.getMe();
        if (res.barber) {
          const b = res.barber;
          setProfile({
            bio: b.bio || '',
            experienceYears: b.experienceYears || 0,
            workingSince: b.workingSince ? b.workingSince.substring(0, 10) : '',
            specialties: b.specialties || [],
            gallery: b.gallery || []
          });
        }
      } catch (err) {
        setError('Không thể tải thông tin hồ sơ: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSpecialtyKeyDown = (e) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const val = specialtyInput.trim().replace(/^,|,$/g, ''); // Xoá dấu phẩy bị dính
      if (val && !profile.specialties.includes(val)) {
        setProfile(prev => ({ ...prev, specialties: [...prev.specialties, val] }));
      }
      setSpecialtyInput('');
    }
  };

  const handleRemoveSpecialty = (tagToRemove) => {
    setProfile(prev => ({
      ...prev,
      specialties: prev.specialties.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUploadGallery = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (profile.gallery.length + files.length > 4) {
      setError('Bạn chỉ được phép tải lên tối đa 4 ảnh tác phẩm tiêu biểu.');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      setUploading(true);
      setError('');
      const res = await barberService.uploadGalleryImages(formData);
      if (res && res.gallery) {
        setProfile(prev => ({ ...prev, gallery: res.gallery }));
        setMessage('Tải ảnh lên thành công!');
      }
    } catch (err) {
      setError('Lỗi tải ảnh: ' + err.message);
    } finally {
      setUploading(false);
      // reset file input
      e.target.value = null;
    }
  };

  const handleDeleteGallery = async (imageUrl) => {
    if (!confirm('Bạn có chắc muốn xoá ảnh này khỏi bộ sưu tập?')) return;
    
    try {
      setUploading(true);
      setError('');
      const res = await barberService.removeGalleryImage(imageUrl);
      if (res && res.gallery) {
        setProfile(prev => ({ ...prev, gallery: res.gallery }));
        setMessage('Xoá ảnh thành công!');
      }
    } catch (err) {
      setError('Lỗi xoá ảnh: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const workingSinceDate = profile.workingSince ? new Date(profile.workingSince) : new Date();
      const calculatedExp = Math.max(0, new Date().getFullYear() - workingSinceDate.getFullYear());
      
      const payload = {
        bio: profile.bio,
        experienceYears: calculatedExp,
        workingSince: workingSinceDate.toISOString(),
        specialties: profile.specialties
      };

      await barberService.updateMyProfile(payload);
      setMessage('Cập nhật hồ sơ thành công!');
    } catch (err) {
      setError('Lỗi khi cập nhật hồ sơ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col text-on-surface font-body-md h-full">
      <div className="flex-grow max-w-7xl w-full mx-auto px-gutter py-section-gap flex flex-col gap-section-gap">
        <div className="mb-6">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Cấu hình hồ sơ cá nhân</h2>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            Cập nhật thông tin giới thiệu, kinh nghiệm và kỹ năng của bạn để hiển thị cho khách hàng.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-outline-gold bg-surface-container-low p-8 text-center text-on-surface-variant">
            Đang tải dữ liệu...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="rounded-2xl bg-error/10 border border-error/50 px-4 py-3 text-error">{error}</div>}
            {message && <div className="rounded-2xl bg-success/10 border border-success/50 px-4 py-3 text-success">{message}</div>}
            
            <div className="rounded-3xl border border-outline-gold bg-surface-container-low p-6">
              <h3 className="font-headline-sm text-headline-sm mb-4">Thông tin cơ bản</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-label-md text-primary uppercase tracking-widest">Tiểu sử (Bio)</label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-surface-container border border-outline-variant py-3 px-4 text-on-surface rounded focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                    placeholder="Giới thiệu đôi nét về bản thân..."
                    required
                  ></textarea>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-label-md text-primary uppercase tracking-widest">Ngày bắt đầu làm việc</label>
                  <input
                    type="date"
                    name="workingSince"
                    value={profile.workingSince}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container border border-outline-variant py-3 px-4 text-on-surface rounded focus:border-primary outline-none"
                  />
                  <p className="text-body-sm text-on-surface-variant">Số năm kinh nghiệm sẽ được hệ thống tự động tính dựa trên ngày này.</p>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-label-md text-primary uppercase tracking-widest">Thế mạnh / Các kiểu tóc chuyên môn</label>
                  <div className="w-full bg-surface-container border border-outline-variant p-2 text-on-surface rounded focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 min-h-[50px] flex flex-wrap gap-2 items-center">
                    {profile.specialties.map((tag, idx) => (
                      <span key={idx} className="flex items-center gap-1 bg-surface-container-high border border-outline-variant px-3 py-1.5 rounded-md text-label-md text-on-surface-variant">
                        {tag}
                        <button type="button" onClick={() => handleRemoveSpecialty(tag)} className="text-outline hover:text-error transition-colors flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={specialtyInput}
                      onChange={(e) => setSpecialtyInput(e.target.value)}
                      onKeyDown={handleSpecialtyKeyDown}
                      className="flex-grow bg-transparent border-none outline-none min-w-[150px] px-2 py-1 placeholder-on-surface-variant/50"
                      placeholder={profile.specialties.length === 0 ? "Nhập tag và bấm phẩy (,) hoặc Enter..." : "Thêm tag..."}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-outline-gold bg-surface-container-low p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-sm text-headline-sm">Tác phẩm tiêu biểu (Gallery)</h3>
                <label className="cursor-pointer bg-primary/10 text-primary px-4 py-2 rounded-full font-bold uppercase tracking-widest text-label-md hover:bg-primary/20 transition flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">upload</span>
                  {uploading ? 'Đang tải...' : 'Thêm ảnh'}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleUploadGallery} disabled={uploading} />
                </label>
              </div>
              <p className="text-body-sm text-on-surface-variant mb-6">Tải lên những kiểu tóc đẹp nhất do chính tay bạn thực hiện để thu hút khách hàng.</p>
              
              {profile.gallery && profile.gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profile.gallery.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-outline-variant">
                      <img src={url} alt="Gallery item" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button" 
                          onClick={() => handleDeleteGallery(url)}
                          className="bg-error text-on-error p-2 rounded-full flex hover:bg-error-focus transition"
                          title="Xóa ảnh"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">photo_library</span>
                  <p>Chưa có ảnh nào trong bộ sưu tập.</p>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-primary-focus transition disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
