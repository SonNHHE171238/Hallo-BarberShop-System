"use client";

import React, { useState, useRef, useEffect } from "react";
import toast from 'react-hot-toast';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return `http://${window.location.hostname}:5000/api/chatbot`;
  return 'http://localhost:5000/api/chatbot';
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(null); // 'staff' | 'ai' | null
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTestStabilityLoading, setIsTestStabilityLoading] = useState(false);
  const [testStabilityResult, setTestStabilityResult] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isBarberMenuOpen, setIsBarberMenuOpen] = useState(false);
  const [barberData, setBarberData] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleChat = () => {
    if (!isOpen && !mode) {
      // Khi vừa mở lần đầu, thêm message chào mừng
      setMessages([{ role: "system", content: "Chào bạn! Bạn muốn nhắn tin với nhân viên hay trò chuyện với AI Assistant?" }]);
    }
    setIsOpen(!isOpen);
  };

  const selectMode = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === "ai") {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "Bạn đã chọn nhắn tin với AI. Hãy hỏi tôi về dịch vụ, thợ cắt tóc hoặc giá cả nhé!" },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "Đang kết nối với nhân viên tư vấn... Vui lòng đợi trong giây lát." },
      ]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || mode !== "ai" || isLoading) return;

    const userMsg = input.trim();
    const imageToSend = selectedImage;
    setInput("");
    setSelectedImage(null);

    // Convert current messages to history format
    const history = messages.filter(m => m.role === 'user' || m.role === 'ai').map(m => ({
      role: m.role,
      content: m.content
    }));

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg, image: imageToSend?.preview }
    ]);
    setIsLoading(true);

    try {
      const payload = { message: userMsg, history };
      if (imageToSend) {
        payload.imageBase64 = imageToSend.base64;
        payload.mimeType = imageToSend.mimeType;
      }

      const res = await fetch(getBaseUrl(), { // Default backend port might be 5000 or from env
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        if (data.type === 'hairstyle_advice') {
          setMessages((prev) => [...prev, { role: "ai", isAdvice: true, data: data.data }]);
        } else if (data.type === 'menu') {
          setMessages((prev) => [...prev, { role: "ai", isMenu: true, content: data.data.text, services: data.data.services }]);
        } else if (data.type === 'barber_menu') {
          setMessages((prev) => [...prev, { role: "ai", isBarberMenu: true, content: data.data.text, barbers: data.data.barbers }]);
        } else {
          setMessages((prev) => [...prev, { role: "ai", content: data.data }]);
        }
      } else {
        setMessages((prev) => [...prev, { role: "system", content: "Lỗi kết nối với máy chủ AI." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "system", content: "Không thể kết nối với server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh quá lớn, vui lòng chọn ảnh < 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setSelectedImage({
          preview: reader.result,
          base64: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestStability = async () => {
    if (!selectedImage) return;
    setIsTestStabilityLoading(true);
    setTestStabilityResult(null);
    try {
      // Create FormData from Base64
      const byteCharacters = atob(selectedImage.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: selectedImage.mimeType });
      
      const formData = new FormData();
      formData.append('image', blob, 'test.jpg');
      
      const res = await fetch("http://localhost:5000/api/chatbot/test-stability-preview", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data.previewImageBase64) {
        setTestStabilityResult(data.data.previewImageBase64);
        toast.success("Test Stability thành công!");
      } else {
        toast.error(data.message || "Lỗi khi gọi Stability API");
      }
    } catch (error) {
      toast.error("Lỗi kết nối API Test Stability");
    } finally {
      setIsTestStabilityLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Nút bong bóng chat */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-primary hover:bg-primary-fixed text-on-primary rounded-full p-4 shadow-lg shadow-primary/20 transition-transform transform hover:scale-105 flex items-center justify-center border border-primary/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="bg-surface-container/90 backdrop-blur-md rounded-xl shadow-2xl shadow-black/50 w-80 md:w-96 overflow-hidden flex flex-col border border-outline-gold" style={{ height: "500px" }}>
          {/* Header */}
          <div className="bg-surface-container-high border-b border-outline-gold text-primary p-4 flex justify-between items-center shadow-sm">
            <div className="font-semibold font-headline-sm uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Trợ lý Hallo
            </div>
            <button onClick={toggleChat} className="text-on-surface-variant hover:text-error transition-colors focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-surface-container-lowest/50 custom-scrollbar flex flex-col gap-4">
            {messages.map((msg, idx) => {
              if (msg.isAdvice) {
                const { advice, previewImageUrl, matchedServices } = msg.data;
                return (
                  <div key={idx} className="flex justify-start">
                    <div className="max-w-[95%] rounded-2xl p-4 text-sm font-body-md bg-surface-container-high border border-outline-gold/30 text-on-surface rounded-bl-none shadow-sm flex flex-col gap-3">
                      <div className="font-bold text-primary">💈 Kết quả Phân tích & Tư vấn</div>
                      <div className="text-sm">
                        <p><strong>Dáng mặt:</strong> {advice?.faceShape}</p>
                        <p><strong>Nhận xét tóc:</strong> {advice?.currentHairObservation}</p>
                        <p className="mt-2 text-primary font-medium">{advice?.overallAdvice}</p>
                      </div>

                      {previewImageUrl ? (
                        <div className="mt-2">
                          <p className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Ảnh mô phỏng (AI Preview):</p>
                          <img src={previewImageUrl} alt="AI Preview" className="w-full h-auto rounded-xl border border-outline-variant shadow-md" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      ) : (
                        <div className="mt-2 p-2 bg-surface-container-highest rounded-lg text-xs italic text-on-surface-variant flex items-center gap-2 border border-outline-variant/50">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Chưa tạo được ảnh preview, chỉ hiển thị tư vấn.
                        </div>
                      )}

                      {advice?.recommendedStyles && advice.recommendedStyles.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant mb-2">Đề xuất hàng đầu:</p>
                          <div className="flex flex-col gap-2">
                            {advice.recommendedStyles.slice(0, 3).map((style, sIdx) => (
                              <div key={sIdx} className="bg-surface-container p-3 rounded-lg border border-outline-variant/50">
                                <p className="font-bold text-primary">{style.styleName}</p>
                                <p className="text-xs text-on-surface-variant mt-1">{style.description}</p>
                                <p className="text-xs text-secondary mt-1"><strong>Lý do:</strong> {style.whyItFits}</p>
                                <p className="text-xs italic text-on-surface mt-1 bg-surface-container-highest p-1.5 rounded">Ghi chú cho thợ: &quot;{style.barberInstruction}&quot;</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {matchedServices && matchedServices.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Dịch vụ phù hợp tại Shop:</p>
                          <div className="flex flex-wrap gap-1">
                            {matchedServices.map((svc, svcIdx) => (
                              <span key={svcIdx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                                {svc.name} - {svc.price.toLocaleString('vi-VN')}đ
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {advice?.barberNote && (
                        <div className="mt-2 p-2 bg-error/10 text-error rounded-lg text-xs font-medium border border-error/20">
                          <strong>Lời nhắn cho thợ:</strong> {advice.barberNote}
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              if (msg.isMenu) {
                return (
                  <div key={idx} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl p-3 text-sm font-body-md flex flex-col gap-2 bg-surface-container-high border border-outline-gold/30 text-on-surface rounded-bl-none shadow-sm">
                      {msg.content && <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>}
                      <button
                        onClick={() => { setMenuData(msg.services); setSelectedServices([]); setIsMenuOpen(true); }}
                        className="mt-2 bg-primary text-on-primary py-2 px-4 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-primary-fixed transition-colors text-center shadow-md flex justify-center items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Mở Menu Dịch Vụ
                      </button>
                    </div>
                  </div>
                );
              }

              if (msg.isBarberMenu) {
                return (
                  <div key={idx} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl p-3 text-sm font-body-md flex flex-col gap-2 bg-surface-container-high border border-outline-gold/30 text-on-surface rounded-bl-none shadow-sm">
                      {msg.content && <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>}
                      <button 
                        onClick={() => { setBarberData(msg.barbers); setSelectedBarber(null); setIsBarberMenuOpen(true); }}
                        className="mt-2 bg-secondary text-on-secondary py-2 px-4 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-secondary-fixed transition-colors text-center shadow-md flex justify-center items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Mở Danh Sách Thợ
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-sm font-body-md flex flex-col gap-2 ${msg.role === 'user'
                      ? 'bg-primary text-on-primary rounded-br-none shadow-md shadow-primary/10'
                      : msg.role === 'system'
                        ? 'bg-surface-container border border-outline-variant text-on-surface-variant italic text-center w-full rounded-xl text-xs'
                        : 'bg-surface-container-high border border-outline-gold/30 text-on-surface rounded-bl-none shadow-sm'
                      }`}
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {msg.image && (
                      <img src={msg.image} alt="User Upload" className="max-w-full rounded-lg object-contain" />
                    )}
                    {msg.content && <span>{msg.content}</span>}
                  </div>
                </div>
              );
            })}

            {/* Lựa chọn mode */}
            {!mode && messages.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => selectMode('staff')}
                  className="bg-transparent border border-outline-variant text-on-surface hover:text-primary hover:border-primary px-4 py-2.5 rounded-xl font-label-md uppercase tracking-wider text-[11px] transition-all"
                >
                  Nhắn tin với Nhân viên
                </button>
                <button
                  onClick={() => selectMode('ai')}
                  className="bg-primary text-on-primary hover:bg-primary-fixed border border-primary px-4 py-2.5 rounded-xl font-label-md uppercase tracking-wider text-[11px] transition-all shadow-md shadow-primary/20"
                >
                  Nhắn tin với AI Assistant
                </button>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-container-high border border-outline-gold/30 text-primary rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-surface-container-high border-t border-outline-gold">
            {selectedImage && (
              <div className="mb-2 relative inline-block">
                <img src={selectedImage.preview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-outline-variant" />
                <button
                  onClick={() => { setSelectedImage(null); setTestStabilityResult(null); }}
                  className="absolute -top-2 -right-2 bg-error text-white rounded-full p-0.5 hover:bg-error/90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="mt-2 flex flex-col gap-2">
                  <button 
                    type="button" 
                    onClick={handleTestStability} 
                    disabled={isTestStabilityLoading}
                    className="text-[10px] bg-secondary text-white px-2 py-1 rounded shadow hover:bg-secondary/90 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isTestStabilityLoading ? "Đang xử lý..." : "🧪 Test Stability"}
                  </button>
                  {testStabilityResult && (
                    <img src={testStabilityResult} alt="Stability Result" className="h-32 w-auto object-contain rounded-lg border-2 border-primary shadow-lg" />
                  )}
                </div>
              </div>
            )}
            <form onSubmit={sendMessage} className="flex gap-2 relative items-center">
              {mode === 'ai' && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-on-surface-variant hover:text-primary transition-colors p-1"
                    title="Tải ảnh lên"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'ai'
                    ? "Nhập câu hỏi của bạn..."
                    : mode === 'staff'
                      ? "Tính năng đang phát triển..."
                      : "Vui lòng chọn đối tượng chat"
                }
                disabled={mode !== 'ai'}
                className="flex-1 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant text-on-surface placeholder-outline-variant rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-sm disabled:opacity-50 disabled:bg-surface-container transition-all"
              />
              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || mode !== 'ai' || isLoading}
                className="bg-primary text-on-primary rounded-full p-2.5 hover:bg-primary-fixed disabled:bg-outline-variant disabled:text-on-surface-variant disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Menu Modal Overlay */}
      {isMenuOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 rounded-2xl">
          <div className="bg-surface w-full max-w-sm rounded-2xl shadow-xl flex flex-col max-h-[90%] overflow-hidden border border-outline-variant">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
              <h3 className="font-bold text-primary">Chọn Dịch Vụ</h3>
              <button onClick={() => setIsMenuOpen(false)} className="text-on-surface-variant hover:text-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
              {menuData.map((svc, i) => (
                <label key={i} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedServices.includes(svc.name) ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container'}`}>
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-primary bg-surface-container-highest border-outline-variant rounded focus:ring-primary focus:ring-2"
                    checked={selectedServices.includes(svc.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServices(prev => [...prev, svc.name]);
                      } else {
                        setSelectedServices(prev => prev.filter(s => s !== svc.name));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-on-surface">{svc.name}</p>
                    <p className="text-xs text-secondary mt-0.5">{svc.price.toLocaleString('vi-VN')} VNĐ</p>
                    {svc.description && <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">{svc.description}</p>}
                  </div>
                </label>
              ))}
            </div>
            <div className="p-4 border-t border-outline-variant bg-surface-container-high">
              <button
                onClick={() => {
                  if (selectedServices.length > 0) {
                    setIsMenuOpen(false);
                    const userMsg = `Tôi muốn đặt các dịch vụ: ${selectedServices.join(', ')}`;

                    const history = messages.filter(m => m.role === 'user' || m.role === 'ai').map(m => ({ role: m.role, content: m.content }));
                    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
                    setIsLoading(true);

                    fetch(getBaseUrl(), {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ message: userMsg, history }),
                    }).then(res => res.json()).then(data => {
                      if (data.success) {
                        if (data.type === 'hairstyle_advice') {
                          setMessages((prev) => [...prev, { role: "ai", isAdvice: true, data: data.data }]);
                        } else if (data.type === 'menu') {
                          setMessages((prev) => [...prev, { role: "ai", isMenu: true, content: data.data.text, services: data.data.services }]);
                        } else if (data.type === 'barber_menu') {
                          setMessages((prev) => [...prev, { role: "ai", isBarberMenu: true, content: data.data.text, barbers: data.data.barbers }]);
                        } else {
                          setMessages((prev) => [...prev, { role: "ai", content: data.data }]);
                        }
                      } else {
                        setMessages((prev) => [...prev, { role: "system", content: "Lỗi kết nối với máy chủ AI." }]);
                      }
                    }).catch(error => {
                      setMessages((prev) => [...prev, { role: "system", content: "Không thể kết nối với server." }]);
                    }).finally(() => setIsLoading(false));
                  } else {
                    toast.error('Vui lòng chọn ít nhất 1 dịch vụ');
                  }
                }}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-primary-fixed shadow-md shadow-primary/20"
              >
                Xác nhận Lựa Chọn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barber Modal Overlay */}
      {isBarberMenuOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 rounded-2xl">
          <div className="bg-surface w-full max-w-sm rounded-2xl shadow-xl flex flex-col max-h-[90%] overflow-hidden border border-outline-variant">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
              <h3 className="font-bold text-primary">Chọn Thợ Cắt Tóc</h3>
              <button onClick={() => setIsBarberMenuOpen(false)} className="text-on-surface-variant hover:text-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedBarber === 'Any' ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container'}`}>
                <input 
                  type="radio" 
                  name="barberSelection"
                  className="w-4 h-4 text-primary bg-surface-container-highest border-outline-variant focus:ring-primary focus:ring-2"
                  checked={selectedBarber === 'Any'}
                  onChange={() => setSelectedBarber('Any')}
                />
                <div className="flex-1">
                  <p className="font-bold text-sm text-on-surface">Bất kỳ thợ nào</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Tiệm sẽ tự sắp xếp thợ phù hợp cho bạn</p>
                </div>
              </label>

              {barberData.map((barber, i) => (
                <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedBarber === barber.name ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container'}`}>
                  <input 
                    type="radio" 
                    name="barberSelection"
                    className="w-4 h-4 text-primary bg-surface-container-highest border-outline-variant focus:ring-primary focus:ring-2"
                    checked={selectedBarber === barber.name}
                    onChange={() => setSelectedBarber(barber.name)}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-on-surface">{barber.name}</p>
                    <p className="text-xs text-secondary mt-0.5">Kinh nghiệm: {barber.experienceYears} năm</p>
                    {barber.specialties && barber.specialties.length > 0 && (
                      <p className="text-[11px] text-on-surface-variant mt-0.5">Chuyên môn: {barber.specialties.join(', ')}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <div className="p-4 border-t border-outline-variant bg-surface-container-high">
              <button 
                onClick={() => {
                  if (selectedBarber) {
                    setIsBarberMenuOpen(false);
                    const userMsg = selectedBarber === 'Any' ? `Tôi không yêu cầu thợ cụ thể, tiệm tự sắp xếp nhé` : `Tôi muốn đặt thợ: ${selectedBarber}`;
                    
                    const history = messages.filter(m => m.role === 'user' || m.role === 'ai').map(m => ({ role: m.role, content: m.content }));
                    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
                    setIsLoading(true);
                    
                    fetch(getBaseUrl(), {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ message: userMsg, history }),
                    }).then(res => res.json()).then(data => {
                      if (data.success) {
                        if (data.type === 'hairstyle_advice') {
                          setMessages((prev) => [...prev, { role: "ai", isAdvice: true, data: data.data }]);
                        } else if (data.type === 'menu') {
                          setMessages((prev) => [...prev, { role: "ai", isMenu: true, content: data.data.text, services: data.data.services }]);
                        } else if (data.type === 'barber_menu') {
                          setMessages((prev) => [...prev, { role: "ai", isBarberMenu: true, content: data.data.text, barbers: data.data.barbers }]);
                        } else {
                          setMessages((prev) => [...prev, { role: "ai", content: data.data }]);
                        }
                      } else {
                        setMessages((prev) => [...prev, { role: "system", content: "Lỗi kết nối với máy chủ AI." }]);
                      }
                    }).catch(error => {
                      setMessages((prev) => [...prev, { role: "system", content: "Không thể kết nối với server." }]);
                    }).finally(() => setIsLoading(false));
                  } else {
                    toast.error('Vui lòng chọn 1 thợ hoặc tuỳ chọn Bất kỳ');
                  }
                }}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-primary-fixed shadow-md shadow-primary/20"
              >
                Xác nhận Lựa Chọn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
